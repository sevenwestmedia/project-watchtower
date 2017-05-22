import CONFIG from '../config/config'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { formatFileSize } from '../util/fs'
import { formatTimeMs, timeout } from '../util/time'
import { getSequenceAverage } from '../util/math'
import { runStatsOnServer, loadSSRPage } from './server'

const { HAS_SERVER } = CONFIG

const ssrStats = async (): Promise<BuildMetrics> => {

    if (!HAS_SERVER) {
        log('Skipping SSR stats because the application has no server')
        return {}
    }

    log('Measuring SSR load times...')

    const stats: BuildMetrics = {}

    try {
        await runStatsOnServer(async ({ page, url }) => {

            const loadPage = () => timeout(loadSSRPage(url), 20000)

            const { size } = await loadPage()

            const time = await getSequenceAverage(async () => {
                const result = await loadPage()
                return result.time
            }, 5)

            stats[`${page}_ssr_document_size`] = formatFileSize(size)
            stats[`${page}_ssr_loadtime`] = formatTimeMs(time)
        })

        log(`SSR stats: ${prettyJson(stats)}`)

        return stats
    } catch (err) {
        logError('Error measuring SSR stats', err)
        return {}
    }
}

export default ssrStats
