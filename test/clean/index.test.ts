import fs from 'fs'
import path from 'path'
import * as mkdirp from 'mkdirp'
import clean from '../../lib/clean'
import { getConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/clean')

const doClean = async (paths: string | string[]) => {
    const filePath = path.resolve(buildConfig.OUTPUT, 'foo.js')

    try {
        mkdirp.sync(buildConfig.OUTPUT)
    } catch (e) {
        // do nothing
    }
    fs.writeFileSync(filePath, 'hello')

    await clean(log, paths)

    expect(fs.existsSync(filePath)).toBe(false)
}

describe('lib/clean', () => {
    it('will clean', async () => {
        await doClean(buildConfig.OUTPUT)
        await doClean([buildConfig.OUTPUT])
    })
})
