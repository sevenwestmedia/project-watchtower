import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'
import clean from '../../lib/bin/clean'
import { getConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'

const log = createConsoleLogger()

describe('bin/clean', () => {
    it('will clean', async () => {
        const buildConfig = getConfig(log, process.cwd())
        buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/binclean')

        const filePath = path.resolve(buildConfig.OUTPUT, 'foo.js')

        try {
            mkdirp.sync(buildConfig.OUTPUT)
        } catch (e) {
            // do nothing
        }
        fs.writeFileSync(filePath, 'hello')

        await clean(log, buildConfig)

        expect(fs.existsSync(filePath)).toBe(false)
    })
})
