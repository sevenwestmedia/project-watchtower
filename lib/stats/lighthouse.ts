import fs from 'fs'
import lighthouse from 'lighthouse'
import path from 'path'
import { Logger } from 'typescript-log'
import { promisify } from 'util'
import { BuildConfig } from '../../lib'
import { formatTimeMs, timeout } from '../util/time'
import { BuildMetrics } from './'
import { runStatsOnServer } from './server'

export const runLighthouse = async (log: Logger, url: string) => {
    try {
        log.debug({ url }, 'Running lighthouse')
        const results = await lighthouse(
            url,
            {
                output: 'json',
                // provided by build environment, ref OPS-383
                port: Number(process.env.CHROME_REMOTE_DEBUGGING_PORT) || 9222,
                skipAutolaunch: true,
            },
            {
                extends: 'lighthouse:default',
                settings: {},
            },
        )

        return results
    } catch (err) {
        log.error({ err }, 'Could not run lighthouse!')

        return undefined
    }
}

export const lighthouseStats = async (
    log: Logger,
    buildConfig: BuildConfig,
    verbose = false,
): Promise<BuildMetrics> => {
    if (!buildConfig.HAS_SERVER) {
        log.info('Skipping lighthouse performance metrics because the application has no server')
        return {}
    }

    log.info('Measuring lighthouse performance metrics...')

    const stats: BuildMetrics = {}
    let lighthouseResult: Lighthouse.LighthouseResults | undefined

    try {
        await runStatsOnServer(
            log,
            buildConfig,
            async ({ page, url }) => {
                lighthouseResult = await timeout(runLighthouse(log, url), 120000)

                const addLighthouseValue = (lighthouseKey: string, statsKey: string) => {
                    const result =
                        lighthouseResult &&
                        lighthouseResult.lhr &&
                        lighthouseResult.lhr.audits &&
                        lighthouseResult.lhr.audits[lighthouseKey] &&
                        (lighthouseResult.lhr.audits[lighthouseKey].rawValue as number)

                    if (result !== undefined && result !== null) {
                        stats[`${page}_${statsKey}`] = formatTimeMs(+result)
                    }
                }

                addLighthouseValue('first-contentful-paint', 'first_contentful_paint')
                addLighthouseValue('first-meaningful-paint', 'first_meaningful_paint')
                addLighthouseValue('first-cpu-idle', 'first_cpu_idle')
                addLighthouseValue('estimated-input-latency', 'estimated_input_latency')
                addLighthouseValue('interactive', 'interactive')
                addLighthouseValue('bootup-time', 'bootup_time')
                addLighthouseValue('network-requests', 'network_requests')
                addLighthouseValue('total-byte-weight', 'total_byte_weight')
                addLighthouseValue('speed-index', 'speed_index')

                if (lighthouseResult) {
                    for (const category in lighthouseResult.lhr.categories) {
                        if (lighthouseResult.lhr.categories.hasOwnProperty(category)) {
                            stats[`${page}_category_${category}_score`] = (
                                lighthouseResult.lhr.categories[category].score * 100
                            ).toFixed(0)
                        }
                    }
                    if (lighthouseResult.lhr.audits['dom-size']) {
                        const domSize: any = lighthouseResult.lhr.audits['dom-size']
                        for (const key in domSize.details.items) {
                            if (domSize.details.items.hasOwnProperty(key)) {
                                const statsKey = domSize.details.items[key].statistic
                                    .toLowerCase()
                                    .replace(/ /g, '_')
                                stats[`${page}_${statsKey}`] = formatTimeMs(
                                    +domSize.details.items[key].value,
                                )
                            }
                        }
                    }

                    const reportPath = path.resolve(
                        buildConfig.BASE,
                        `lighthouse-report_${page}.json`,
                    )
                    log.info(
                        `Lighthouse results written to '${reportPath}', you can view them visually at https://googlechrome.github.io/lighthouse/viewer/`,
                    )
                    await promisify(fs.writeFile)(reportPath, lighthouseResult.report)
                }

                log.info({ stats }, `Lighthouse stats`)
            },
            verbose,
        )

        return stats
    } catch (err) {
        log.error({ err }, 'Error measuring lighthouse stats')
        throw new Error('Error measuring lighthouse stats')
    }
}
