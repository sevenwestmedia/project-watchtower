import * as http from 'http'
import * as path from 'path'
import { fork } from 'child_process'
import * as dotenv from 'dotenv'
import CONFIG from '../config/config'
import { getPort } from '../server/server'
import { waitForConnection } from '../util/network'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { readFile } from '../util/fs'
import { delay, formatTimeMs } from '../util/time'

import * as Lighthouse from 'lighthouse'
import { ChromeLauncher } from 'lighthouse/lighthouse-cli/chrome-launcher'

dotenv.config()

const { SERVER_OUTPUT, HAS_SERVER } = CONFIG
const port = getPort()

const runLighthouse = async () => {
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
            `http://localhost:${port}`,
            { output: 'json', port: 9222 },
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

const loadPage = () => (
    new Promise<void>((resolve, reject) => {
        const request = http.get('http://localhost:' + port, (res) => {
            res.on('data', () => {})
            res.on('end', () => resolve())
        })
        request.on('error', (err) => reject(err))
    })
)

const lighthouseStats = async (): Promise<BuildMetrics> => {

    if (!HAS_SERVER) {
        log('Skipping lighthouse performance metrics because the application has no server')
        return {}
    }

    log('Measuring lighthouse performance metrics...')

    try {
        const serverEntryFile = path.resolve(SERVER_OUTPUT, 'server.js')

        const devServer = fork(
            serverEntryFile,
            [],
            {
                env: process.env,
                silent: true,
            },
        )

        await waitForConnection(port)

        // warm-up
        await Promise.all([
            loadPage(),
            loadPage(),
            loadPage(),
        ])

        const lighthouseResult = await runLighthouse()

        const getLighthouseValue = (key: string) => (
            formatTimeMs((
                lighthouseResult
                && lighthouseResult.audits
                && lighthouseResult.audits[key]
                && lighthouseResult.audits[key].rawValue as number
            ) || 0)
        )

        devServer.kill()

        const stats: BuildMetrics = {
            first_meaningful_paint: getLighthouseValue('first-meaningful-paint'),
            speed_index: getLighthouseValue('speed-index-metric'),
            time_to_interactive: getLighthouseValue('time-to-interactive'),
        }

        log(`Lighthouse stats: ${prettyJson(stats)}`)

        return stats
    } catch (e) {
        logError('Error measuring lighthouse stats')
        return {}
    }
}

export default lighthouseStats
