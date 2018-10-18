import fs from 'fs'
import path from 'path'
import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import { getAbsoluteAssetPath, getAssetLocations } from '../../lib/runtime/server/assets'
import { getConfig, getRuntimeConfigFromBuildConfig } from '../../lib/runtime/config/config'

// Increase test timeout because builds might take a while
import { createConsoleLogger } from '../../lib/runtime/universal'
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

const log = createConsoleLogger()

describe('bin/build', () => {
    it('will build', async () => {
        const testProjectDir = path.join(process.cwd(), './test/test-project')
        const buildConfig = getConfig(log, testProjectDir)
        buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/binbuild')

        const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)
        const { OUTPUT } = buildConfig
        await clean(log, buildConfig)
        await build(log, buildConfig)

        const filePath = path.resolve(OUTPUT, 'server.js')
        expect(fs.existsSync(filePath)).toBe(true)

        const assetsPath = path.resolve(OUTPUT, 'assets.json')
        expect(fs.existsSync(assetsPath)).toBe(true)

        const watchtowerConfig = path.resolve(OUTPUT, 'watchtower.config')
        expect(fs.existsSync(assetsPath)).toBe(true)

        const assets = getAssetLocations(runtimeConfig)

        const files = [assets.main.js, assets.main.css, assets.vendor.js].map(f =>
            getAbsoluteAssetPath(runtimeConfig, f),
        )

        expect(fs.readFileSync(watchtowerConfig).toString()).toMatchSnapshot()
        files.forEach(f => {
            expect(fs.existsSync(f)).toBe(true)
        })
    })
})
