import path from 'path'
import clean from '../../../lib/bin/clean'
import {
    updateAssetLocations,
    getAssetLocations,
    getAbsoluteAssetPath,
} from '../../../lib/runtime/server/assets'
import { getConfig, getRuntimeConfigFromBuildConfig } from '../../../lib/runtime/config/config'
import { createConsoleLogger } from '../../../lib/runtime/universal'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/assets')

const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)

const assets = {
    main: {
        js: 'foo/main.chunk.js',
        css: 'foo/css/main.css',
    },
    vendor: {
        js: 'foo/vendor.chunk.js',
    },
}

describe('server/assets initial', () => {
    it('throws when no assets have been specified', async () => {
        await clean(log, buildConfig)
        expect(() => getAssetLocations(runtimeConfig)).toThrow()
    })
})

describe('server/assets', () => {
    beforeEach(() => {
        updateAssetLocations(assets)
    })

    it('getAssetLocations', () => {
        expect(getAssetLocations(runtimeConfig)).toEqual(assets)
    })

    it('getAbsoluteAssetPath', () => {
        const assetPath = path.resolve(buildConfig.OUTPUT, 'static/foo/bar.js')

        expect(getAbsoluteAssetPath(runtimeConfig, '/static/foo/bar.js')).toBe(assetPath)
    })
})
