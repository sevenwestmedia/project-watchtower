import CONFIG from '../config/config'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { formatFileSize } from '../util/fs'
import { formatTimeMs } from '../util/time'
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
        await runStatsOnServer(async (page: string, url: string) => {
            const { size } = await loadSSRPage(url)

            const getTime = () => loadSSRPage(url).then((result) => result.time)
            const time = await getSequenceAverage(getTime, 5)

            stats[`${page}_ssr_document_size`] = formatFileSize(size)
            stats[`${page}_ssr_loadtime`] = formatTimeMs(time)
        })

        log(`SSR stats: ${prettyJson(stats)}`)

        return stats
    } catch (e) {
        logError('Error measuring SSR stats')
        return {}
    }
}

export default ssrStats
