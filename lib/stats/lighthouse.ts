import * as path from 'path'
import * as Lighthouse from 'lighthouse'
import { ChromeLauncher } from 'lighthouse/lighthouse-cli/chrome-launcher'
import CONFIG from '../config/config'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { runStatsOnServer } from './server'
import { isBuildServer } from '../util/env'
import { readFile } from '../util/fs'
import { delay, formatTimeMs, timeout } from '../util/time'

const { HAS_SERVER } = CONFIG

export const runLighthouse = async (url: string) => {

    let config: any

    try {
        const configPath = path.resolve(
            process.cwd(),
            'node_modules/lighthouse/lighthouse-core/config/perf.json',
        )
        const configContent = await readFile(configPath)
        config = JSON.parse(configContent)
    } catch (_err) {
        logError('Could not read lighthouse config!')
        return undefined
    }

    const onBuildServer = isBuildServer()

    const launcher = onBuildServer
        ? undefined
        : new ChromeLauncher({
            port: 9222,
            autoSelectChrome: true,
        })

    if (launcher) {
        try {
            await launcher.isDebuggerReady()
        } catch (_err) {
            await launcher.run()
        }
    }

    try {
        const results = await Lighthouse(
            url,
            {
                output: 'json',
                port: onBuildServer
                    // provided by build environment, ref OPS-383
                    ? Number(process.env.CHROME_REMOTE_DEBUGGING_PORT) || 9222
                    : 9222,
                skipAutolaunch: onBuildServer,
            },
            config,
        )

        // we have to wait a bit, otherwise we get a ECONNRESET error we can't catch
        await delay(2000)

        if (launcher) {
            // workaround for uncatcheable rimraf error on Windows
            // when deleting the temporary folder
            launcher.TMP_PROFILE_DIR = undefined
            await launcher.kill()
        }

        return results
    } catch (err) {
        logError('Could not run lighthouse!', err)

        if (launcher) {
            launcher.TMP_PROFILE_DIR = undefined
            await launcher.kill()
        }

        return undefined
    }
}

const lighthouseStats = async (): Promise<BuildMetrics> => {

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
                const result = lighthouseResult
                    && lighthouseResult.audits
                    && lighthouseResult.audits[lighthouseKey]
                    && (lighthouseResult.audits[lighthouseKey].rawValue as number)

                if (result !== undefined && result !== null) {
                    stats[`${page}_${statsKey}`] = formatTimeMs(+result)
                }
            }

            addLighthouseValue('first-meaningful-paint', 'first_meaningful_paint')
            addLighthouseValue('speed-index-metric', 'speed_index')
            addLighthouseValue('time-to-interactive', 'time_to_interactive')
        })

        log(`Lighthouse stats: ${prettyJson(stats)}`)

        return stats
    } catch (err) {
        logError('Error measuring lighthouse stats', err)
        return {}
    }
}

export default lighthouseStats
