import path from 'path'
import { consoleLogger } from 'typescript-log'
import { bin } from '@project-watchtower/cli'
import {
    getBuildConfig,
    getRuntimeConfigFromBuildConfig,
    getAbsoluteAssetPath,
    getAssetLocations,
    updateAssetLocations,
} from '@project-watchtower/server'

const log = consoleLogger()
const buildConfig = getBuildConfig(log, process.cwd())
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
        await bin.clean(log, buildConfig)
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
