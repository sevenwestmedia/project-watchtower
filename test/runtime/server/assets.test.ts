import path from 'path'
import { consoleLogger } from 'typescript-log'
import clean from '../../../lib/bin/clean'
import { getConfig, getRuntimeConfigFromBuildConfig } from '../../../lib/runtime/config/config'
import {
    getAbsoluteAssetPath,
    getAssetLocations,
    updateAssetLocations,
} from '../../../lib/runtime/server/assets'

const log = consoleLogger()
const buildConfig = getConfig(log, process.cwd())
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/assets')

const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)

const assets = {
    main: {
        css: 'foo/css/main.css',
        js: 'foo/main.js',
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
