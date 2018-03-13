import * as fs from 'fs'
import * as path from 'path'
import * as lighthouse from 'lighthouse'
import { BuildMetrics } from './'
import { runStatsOnServer } from './server'
import { formatTimeMs, timeout } from '../util/time'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'
import { promisify } from 'util'

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
                settings: {
                    onlyCategories: ['performance'],
                },
            },
        )

        return results
    } catch (err) {
        log.error({ err }, 'Could not run lighthouse!')

        return undefined
    }
}

const lighthouseStats = async (
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
                        lighthouseResult.audits &&
                        lighthouseResult.audits[lighthouseKey] &&
                        (lighthouseResult.audits[lighthouseKey].rawValue as number)

                    if (result !== undefined && result !== null) {
                        stats[`${page}_${statsKey}`] = formatTimeMs(+result)
                    }
                }

                addLighthouseValue('first-meaningful-paint', 'first_meaningful_paint')
                addLighthouseValue('speed-index-metric', 'speed_index')
                addLighthouseValue('first-interactive', 'time_to_interactive')
                addLighthouseValue('consistently-interactive', 'consistently_interactive')
                addLighthouseValue('dom-size', 'dom_size')

                if (lighthouseResult) {
                    const perfResult = lighthouseResult.reportCategories.filter(
                        category => category.id === 'performance',
                    )[0]

                    if (perfResult && typeof perfResult.score === 'number') {
                        stats[`${page}_perf_score`] = perfResult.score.toFixed(1)
                    }

                    const reportPath = path.resolve(
                        buildConfig.BASE,
                        `lighthouse-report_${page}.json`,
                    )
                    log.info(
                        `Lighthouse results written to '${reportPath}', you can view them visually at https://googlechrome.github.io/lighthouse/viewer/`,
                    )
                    await promisify(fs.writeFile)(
                        reportPath,
                        JSON.stringify(lighthouseResult, undefined, 4),
                    )
                }

                log.info({ stats }, `Lighthouse stats`)
            },
            verbose,
        )

        return stats
    } catch (err) {
        log.error({ err }, 'Error measuring lighthouse stats')
        return {}
    }
}

export default lighthouseStats
