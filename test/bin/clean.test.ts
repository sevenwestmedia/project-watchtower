import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import { consoleLogger } from 'typescript-log'
import { bin } from '@project-watchtower/cli'
import { getBuildConfig } from '@project-watchtower/server'

const log = consoleLogger()

describe('bin/clean', () => {
    it('will clean', async () => {
        const buildConfig = getBuildConfig(log, process.cwd())
        buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/binclean')

        const filePath = path.resolve(buildConfig.OUTPUT, 'foo.js')

        try {
            mkdirp.sync(buildConfig.OUTPUT)
        } catch (e) {
            // do nothing
        }
        fs.writeFileSync(filePath, 'hello')

        await bin.clean(log, buildConfig)

        expect(fs.existsSync(filePath)).toBe(false)
    })
})
