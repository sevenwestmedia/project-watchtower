import * as fs from 'fs'
import * as path from 'path'
import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import { getAbsoluteAssetPath, getAssetLocations } from '../../lib/runtime/server/assets'
import { getConfig } from '../../lib/runtime/config/config'

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

describe('bin/build', () => {
    it('will build', async () => {
        const buildConfig = getConfig(process.cwd())
        const { BASE, SERVER_OUTPUT } = buildConfig
        await clean(buildConfig)
        await build(buildConfig)

        const filePath = path.resolve(SERVER_OUTPUT, 'server.js')
        expect(fs.existsSync(filePath)).toBe(true)

        const assetsPath = path.resolve(BASE, 'assets.json')
        expect(fs.existsSync(assetsPath)).toBe(true)

        const assets = getAssetLocations()

        const files = [assets.main.js, assets.main.css, assets.vendor.js].map(f =>
            getAbsoluteAssetPath(buildConfig, f),
        )

        files.forEach(f => {
            expect(fs.existsSync(f)).toBe(true)
        })
    })
})
