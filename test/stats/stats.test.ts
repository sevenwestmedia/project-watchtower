import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import { getTestPort } from '../test-helpers'
import bundleSize from '../../lib/stats/bundle-size'
import ssrStats from '../../lib/stats/ssr-stats'
import lighthouseStats from '../../lib/stats/lighthouse'
import { getConfig } from '../../lib/runtime/config/config'

const buildConfig = getConfig(process.cwd())

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 90000

describe('stats', () => {
    beforeAll(async () => {
        const port = await getTestPort()
        process.env.PORT = port.toString()

        await clean(buildConfig)
        await build(buildConfig)
    })

    it('bundle-size', async () => {
        const metrics = await bundleSize(buildConfig)

        const total = metrics.bundle_size_total
        const main = metrics.bundle_size_main
        const vendor = metrics.bundle_size_vendor
        const css = metrics.bundle_size_css

        expect(total).toBeDefined()
        expect(main).toBeDefined()
        expect(vendor).toBeDefined()
        expect(css).toBeDefined()

        expect(+main + +vendor).toBeCloseTo(+total)

        expect(+total).not.toBeCloseTo(0)
        expect(+css).not.toBeCloseTo(0)
    })

    it('ssr-stats', async () => {
        const metrics = await ssrStats(buildConfig)

        const documentSize = metrics.home_ssr_document_size
        const domSize = metrics.home_ssr_dom_size
        const loadTime = metrics.home_ssr_loadtime

        expect(documentSize).toBeDefined()
        expect(domSize).toBeDefined()
        expect(loadTime).toBeDefined()

        expect(+documentSize).not.toBeCloseTo(0)
        expect(+domSize).not.toBeCloseTo(0)
        expect(+loadTime).not.toBeCloseTo(0)
    })

    it('lighthouse', async () => {
        const metrics = await lighthouseStats(buildConfig)

        expect(metrics.home_first_meaningful_paint).toBeDefined()
        expect(metrics.home_speed_index).toBeDefined()
        expect(metrics.home_time_to_interactive).toBeDefined()
        expect(metrics.home_consistently_interactive).toBeDefined()
        expect(metrics.home_dom_size).toBeDefined()
        expect(metrics.home_perf_score).toBeDefined()
    })
})
