import * as path from 'path'
import * as http from 'http'
import * as dotenv from 'dotenv'
import CONFIG from '../runtime/config/config'
import { getPort } from '../runtime/server/server'
import { isBuildServer } from '../runtime/util/env'
import { waitForConnection, findFreePort } from '../runtime/util/network'
import { forkPromise } from '../runtime/util/process'
import { log } from '../runtime/util/log'
import { getTimeMs, timeout } from '../runtime/util/time'

dotenv.config()

const { SERVER_OUTPUT, HAS_SERVER, STATS_ENV, STATS_PAGES } = CONFIG

export interface SSRStats {
    size: number
    time: number
    content: string
}

const getServerUrl = (port: number, urlPath: string) => {
    const useUrlPath = urlPath.indexOf('/') === 0
        ? urlPath
        : '/' + urlPath

    const host = isBuildServer()
        // provided by build environment, ref OPS-383
        ? process.env.STATS_SERVER_ADDRESS || 'localhost'
        : 'localhost'

    return `http://${host}:${port}${useUrlPath}`
}

export const loadSSRPage = (url: string) => (
    new Promise<SSRStats>((resolve, reject) => {
        const startTime = getTimeMs()

        const request = http.get(url, (res) => {
            res.setEncoding('utf8')

            let size = 0
            let content = ''
            res.on('data', (chunk) => {
                size += chunk.length
                content += chunk.toString()
            })

            res.on('end', () => {
                const time = getTimeMs() - startTime
                resolve({ size, time, content })
            })
        })
        request.on('error', (err) => reject(err))
    })
)

export interface StatsRunDetails {
    page: string
    urlPath: string
    url: string
    port: number
}

export type StatsFn = (details: StatsRunDetails) => Promise<any>

export const runStatsOnServer = async (statsFn: StatsFn) => {

    if (!HAS_SERVER) {
        log('Skipping server-based stats because the application has no server')
        return
    }

    const port = await findFreePort(getPort())

    const serverEntryFile = path.resolve(SERVER_OUTPUT, 'server.js')

    const devServer = await forkPromise(
        serverEntryFile,
        [],
        {
            env: {
                NODE_ENV: 'production',
                ...process.env,
                ...STATS_ENV,
                PORT: port,
            },
            silent: true,
        },
        true,
    )

    try {
        await timeout(waitForConnection(port), 20000)

        for (const page in STATS_PAGES) {
            if (STATS_PAGES.hasOwnProperty(page)) {
                const urlPath = STATS_PAGES[page]
                const url = getServerUrl(port, urlPath)

                // warm-up
                for (let i = 0; i < 3; i++) {
                    await timeout(loadSSRPage(url), 20000)
                }

                await statsFn({ page, urlPath, url, port })
            }
        }

    } catch (err) {
        throw err
    } finally {
        devServer.kill()
    }
}
