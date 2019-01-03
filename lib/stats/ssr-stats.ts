import { load } from 'cheerio'
import { Logger } from 'typescript-log'
import { BuildConfig } from '../../lib'
import { getSequenceAverage } from '../util/math'
import { formatTimeMs, timeout } from '../util/time'
import { BuildMetrics } from './'
import { loadSSRPage, runStatsOnServer } from './server'

const ssrStats = async (
    log: Logger,
    buildConfig: BuildConfig,
    verbose = false,
): Promise<BuildMetrics> => {
    if (!buildConfig.HAS_SERVER) {
        log.info('Skipping SSR stats because the application has no server')
        return {}
    }

    log.info('Measuring SSR load times...')

    const stats: BuildMetrics = {}

    try {
        await runStatsOnServer(
            log,
            buildConfig,
            async ({ page, url }) => {
                const loadPage = () => timeout(loadSSRPage(url), 20000)

                const { size, content } = await loadPage()

                if (verbose) {
                    log.info(`### SSR content for ${url}`)
                    log.info('---------------------')
                    log.info(content)
                    log.info('---------------------')
                }

                const domSize = load(content)('*').length

                const time = await getSequenceAverage(
                    log,
                    async () => {
                        const result = await loadPage()
                        return result.time
                    },
                    5,
                )

                stats[`${page}_ssr_document_size`] = size.toFixed(0)
                stats[`${page}_ssr_dom_size`] = domSize.toString()
                stats[`${page}_ssr_loadtime`] = formatTimeMs(time)
            },
            verbose,
        )

        log.info({ stats }, `SSR stats`)

        return stats
    } catch (err) {
        log.error({ err }, 'Error measuring SSR stats')
        return {}
    }
}

export default ssrStats
