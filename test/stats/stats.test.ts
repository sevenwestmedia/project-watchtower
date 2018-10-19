import fs from 'fs'
import path from 'path'
import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import stats from '../../lib/bin/stats'
import bundleSize from '../../lib/stats/bundle-size'
import ssrStats from '../../lib/stats/ssr-stats'
import lighthouseStats from '../../lib/stats/lighthouse'
import { getTestPort } from '../test-helpers'
import { getConfig, getRuntimeConfigFromBuildConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'

const log = createConsoleLogger()
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getConfig(log, testProjectDir)
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/stats')

const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 200000

describe('stats', () => {
    beforeAll(async () => {
        const port = await getTestPort()
        buildConfig.DEV_SERVER_PORT = port
        process.env.PROJECT_DIR = './test/test-project'

        await clean(log, buildConfig)
        await build(log, buildConfig)
    })

    it('bundle-size', async () => {
        const metrics = await bundleSize(log, runtimeConfig)

        const main = metrics.bundle_size_main
        const vendor = metrics.bundle_size_vendor
        const css = metrics.bundle_size_css

        expect(main).toBeDefined()
        expect(vendor).toBeDefined()
        expect(css).toBeDefined()

        expect(+main).not.toBeCloseTo(0)
        expect(+vendor).not.toBeCloseTo(0)
        expect(+css).not.toBeCloseTo(0)
    })

    it('ssr-stats', async () => {
        const metrics = await ssrStats(log, buildConfig)

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
        const metrics = await lighthouseStats(log, buildConfig)

        expect(metrics.home_first_meaningful_paint).toBeDefined()
        expect(metrics.home_speed_index).toBeDefined()
        expect(metrics.home_time_to_interactive).toBeDefined()
        expect(metrics.home_consistently_interactive).toBeDefined()
        expect(metrics.home_dom_size).toBeDefined()
        expect(metrics.home_perf_score).toBeDefined()
    })

    it('cli', async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
        await stats(log, buildConfig, 'verbose')

        const filePath = path.resolve(testProjectDir, 'build-stats.csv')
        expect(fs.existsSync(filePath)).toBe(true)
    })
})
