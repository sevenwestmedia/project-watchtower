import * as Lighthouse from 'lighthouse'
import { launch } from 'lighthouse/chrome-launcher'
import CONFIG from '../runtime/config/config'
import { log, logError, prettyJson } from '../runtime/util/log'
import { BuildMetrics } from './'
import { runStatsOnServer } from './server'
import { isBuildServer } from '../runtime/util/env'
import { delay, formatTimeMs, timeout } from '../runtime/util/time'

const { HAS_SERVER } = CONFIG

const killChromeLauncher = (launcher?: Lighthouse.ChromeLauncher) => {
    if (!launcher) {
        return
    }
    setTimeout(() => launcher.kill(), 0)
}

export const runLighthouse = async (url: string) => {
    const onBuildServer = isBuildServer()

    const launcher = onBuildServer ? undefined : await launch()

    try {
        const results = await Lighthouse(
            url,
            {
                output: 'json',
                port: launcher
                    ? launcher.port || 9222
                    : // provided by build environment, ref OPS-383
                      Number(process.env.CHROME_REMOTE_DEBUGGING_PORT) || 9222,
                skipAutolaunch: onBuildServer,
            },
            {
                extends: 'lighthouse:default',
                settings: {
                    onlyCategories: ['performance'],
                },
            },
        )

        // we have to wait a bit, otherwise we get a ECONNRESET error we can't catch
        await delay(2000)

        killChromeLauncher(launcher)

        return results
    } catch (err) {
        logError('Could not run lighthouse!', err)

        killChromeLauncher(launcher)

        return undefined
    }
}

const lighthouseStats = async (verbose = false): Promise<BuildMetrics> => {
    if (!HAS_SERVER) {
        log('Skipping lighthouse performance metrics because the application has no server')
        return {}
    }

    log('Measuring lighthouse performance metrics...')

    const stats: BuildMetrics = {}

    try {
        await runStatsOnServer(async ({ page, url }) => {
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
        }, verbose)

        log(`Lighthouse stats: ${prettyJson(stats)}`)

        return stats
    } catch (err) {
        logError('Error measuring lighthouse stats', err)
        return {}
    }
}

export default lighthouseStats
