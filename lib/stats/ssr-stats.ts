import { load } from 'cheerio'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { formatFileSize } from '../runtime/util/fs'
import { formatTimeMs, timeout } from '../runtime/util/time'
import { getSequenceAverage } from '../runtime/util/math'
import { runStatsOnServer, loadSSRPage } from './server'
import { BuildConfig } from '../../lib'

const ssrStats = async (buildConfig: BuildConfig, verbose = false): Promise<BuildMetrics> => {
    if (!buildConfig.HAS_SERVER) {
        log('Skipping SSR stats because the application has no server')
        return {}
    }

    log('Measuring SSR load times...')

    const stats: BuildMetrics = {}

    try {
        await runStatsOnServer(
            buildConfig,
            async ({ page, url }) => {
                const loadPage = () => timeout(loadSSRPage(url), 20000)

                const { size, content } = await loadPage()

                if (verbose) {
                    log('### SSR content for ', url)
                    log('---------------------')
                    log(content)
                    log('---------------------')
                }

                const domSize = load(content)('*').length

                const time = await getSequenceAverage(async () => {
                    const result = await loadPage()
                    return result.time
                }, 5)

                stats[`${page}_ssr_document_size`] = formatFileSize(size)
                stats[`${page}_ssr_dom_size`] = domSize.toString()
                stats[`${page}_ssr_loadtime`] = formatTimeMs(time)
            },
            verbose,
        )

        log(`SSR stats: ${prettyJson(stats)}`)

        return stats
    } catch (err) {
        logError('Error measuring SSR stats', err)
        return {}
    }
}

export default ssrStats
