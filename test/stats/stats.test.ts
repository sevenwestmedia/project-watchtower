import fs from 'fs'
import path from 'path'
import { consoleLogger } from 'typescript-log'
import build from '../../lib/bin/build'
import clean from '../../lib/bin/clean'
import stats from '../../lib/bin/stats'
import { getConfig, getRuntimeConfigFromBuildConfig } from '../../lib/runtime/config/config'
import bundleSize from '../../lib/stats/bundle-size'
import { lighthouseStats } from '../../lib/stats/lighthouse'
import ssrStats from '../../lib/stats/ssr-stats'
import { getTestPort } from '../test-helpers'

const log = consoleLogger()
const testProjectDir = path.join(process.cwd(), './test/test-project')
const buildConfig = getConfig(log, testProjectDir)
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/stats')

const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)

    // Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 90000

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
        Object.keys(metrics).forEach(metric => {
            metrics[metric] = 'replaced'
        })
        expect(metrics).toMatchSnapshot()
    })

    it('ssr-stats', async () => {
        const metrics = await ssrStats(log, buildConfig)
        Object.keys(metrics).forEach(metric => {
            metrics[metric] = 'replaced'
        })
        expect(metrics).toMatchSnapshot()
    })

    it('lighthouse', async () => {
        const metrics = await lighthouseStats(log, buildConfig)
        Object.keys(metrics).forEach(metric => {
            metrics[metric] = 'replaced'
        })
        expect(metrics).toMatchSnapshot()
    })

    it('cli', async () => {
        await clean(log, buildConfig)
        await build(log, buildConfig)
        await stats(log, buildConfig, 'verbose')

        const filePath = path.resolve(testProjectDir, 'build-stats.csv')
        expect(fs.existsSync(filePath)).toBe(true)
    })
})
