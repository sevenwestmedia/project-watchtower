import * as path from 'path'
import * as Lighthouse from 'lighthouse'
import { ChromeLauncher } from 'lighthouse/lighthouse-cli/chrome-launcher'
import CONFIG from '../config/config'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { runStatsOnServer } from './server'
import { readFile } from '../util/fs'
import { delay, formatTimeMs } from '../util/time'

const { HAS_SERVER } = CONFIG

export const runLighthouse = async (url: string) => {
    const launcher = new ChromeLauncher({
        port: 9222,
        autoSelectChrome: true,
    })

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

    try {
        await launcher.isDebuggerReady()
    } catch (_err) {
        await launcher.run()
    }

    try {
        const results = await Lighthouse(
            url,
            {
                output: 'json',
                port: 9222,
            },
            config,
        )

        // we have to wait a bit, otherwise we get a ECONNRESET error we can't catch
        await delay(2000)

        // workaround for uncatcheable rimraf error on Windows when deleting the temporary folder
        launcher.TMP_PROFILE_DIR = undefined

        await launcher.kill()

        return results
    } catch (err) {
        logError('Could not run lighthouse!', err)
        launcher.TMP_PROFILE_DIR = undefined
        await launcher.kill()
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
        await runStatsOnServer(async (page: string, _urlPath: string, url: string) => {
            const lighthouseResult = await runLighthouse(url)

            const addLighthouseValue = (lighthouseKey: string, statsKey: string) => {
                const result = lighthouseResult
                    && lighthouseResult.audits
                    && lighthouseResult.audits[lighthouseKey]
                    && (lighthouseResult.audits[lighthouseKey].rawValue as number)

                if (result !== undefined) {
                    stats[`${page}_${statsKey}`] = formatTimeMs(result)
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
