import fs from 'fs'
import path from 'path'
import { consoleLogger } from 'typescript-log'
import { bin } from '@project-watchtower/cli'
import {
    getBuildConfig,
    getRuntimeConfigFromBuildConfig,
    getAbsoluteAssetPath,
    getAssetLocations,
} from '@project-watchtower/server'

const log = consoleLogger('info')

describe('bin/build', () => {
    // Increase test timeout because builds might take a while
    jest.setTimeout(60000)

    it('will build', async () => {
        const testProjectDir = path.join(process.cwd(), './test/test-project')
        const buildConfig = getBuildConfig(log, testProjectDir)
        buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/binbuild')

        const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)
        const { OUTPUT } = buildConfig
        await bin.clean(log, buildConfig)
        await bin.build(log, buildConfig)

        const filePath = path.resolve(OUTPUT, 'server.js')
        expect(fs.existsSync(filePath)).toBe(true)

        const assetsPath = path.resolve(OUTPUT, 'assets.json')
        expect(fs.existsSync(assetsPath)).toBe(true)

        const watchtowerConfig = path.resolve(OUTPUT, 'watchtower.config')
        expect(fs.existsSync(assetsPath)).toBe(true)

        const assets = getAssetLocations(runtimeConfig)

        const files = [assets.main.js].map(f => getAbsoluteAssetPath(runtimeConfig, f))

        expect(fs.readFileSync(watchtowerConfig).toString()).toMatchSnapshot()
        files.forEach(f => {
            expect(fs.existsSync(f)).toBe(true)
        })
    })
})
