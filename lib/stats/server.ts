import * as path from 'path'
import * as http from 'http'
import { fork } from 'child_process'
import * as dotenv from 'dotenv'
import CONFIG from '../config/config'
import { getPort } from '../server/server'
import { waitForConnection } from '../util/network'
import { log } from '../util/log'
import { getTimeMs } from '../util/time'

dotenv.config()

const { SERVER_OUTPUT, HAS_SERVER, STATS_ENV, STATS_PAGES } = CONFIG
const port = getPort()

export interface SSRStats {
    size: number
    time: number
}

export const getServerUrl = (urlPath: string) => {
    const useUrlPath = urlPath.indexOf('/') === 0
        ? urlPath
        : '/' + urlPath

    return `http://localhost:${port}${useUrlPath}`
}

export const loadSSRPage = (urlPath: string) => (
    new Promise<SSRStats>((resolve, reject) => {
        const startTime = getTimeMs()

        const request = http.get(getServerUrl(urlPath), (res) => {
            res.setEncoding('utf8')

            let size = 0
            res.on('data', (chunk) => size += chunk.length)

            res.on('end', () => {
                const time = getTimeMs() - startTime
                resolve({ size, time })
            })
        })
        request.on('error', (err) => reject(err))
    })
)

export type StatsFn = (
    page: string,
    urlPath: string,
    completeUrl: string,
) => Promise<any>

export const runStatsOnServer = async (statsFn: StatsFn) => {

    if (!HAS_SERVER) {
        log('Skipping server-based stats because the application has no server')
        return
    }

    const serverEntryFile = path.resolve(SERVER_OUTPUT, 'server.js')

    const devServer = fork(
        serverEntryFile,
        [],
        {
            env: {
                ...process.env,
                ...STATS_ENV,
            },
            silent: true,
        },
    )

    await waitForConnection(port)

    for (const page in STATS_PAGES) {
        if (STATS_PAGES.hasOwnProperty(page)) {
            const urlPath = STATS_PAGES[page]

            // warm-up
            for (let i = 0; i < 3; i++) {
                await loadSSRPage(urlPath)
            }

            await statsFn(page, urlPath, getServerUrl(urlPath))
        }
    }

    devServer.kill()
}
