import * as Lighthouse from 'lighthouse'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { runStatsOnServer } from './server'
import { formatTimeMs, timeout } from '../runtime/util/time'
import { BuildConfig } from '../../lib'

export const runLighthouse = async (url: string) => {
    try {
        const results = await Lighthouse(
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
        logError('Could not run lighthouse!', err)

        return undefined
    }
}

const lighthouseStats = async (
    buildConfig: BuildConfig,
    verbose = false,
): Promise<BuildMetrics> => {
    if (!buildConfig.HAS_SERVER) {
        log('Skipping lighthouse performance metrics because the application has no server')
        return {}
    }

    log('Measuring lighthouse performance metrics...')

    const stats: BuildMetrics = {}

    try {
        await runStatsOnServer(
            buildConfig,
            async ({ page, url }) => {
                const lighthouseResult = await timeout(runLighthouse(url), 120000)

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
                }
            },
            verbose,
        )

        log(`Lighthouse stats: ${prettyJson(stats)}`)

        return stats
    } catch (err) {
        logError('Error measuring lighthouse stats', err)
        return {}
    }
}

export default lighthouseStats
