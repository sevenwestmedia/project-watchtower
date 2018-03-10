import * as fs from 'fs'
import * as path from 'path'
import clean from '../../lib/clean'
import { getConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())

const doClean = async (paths: string | string[]) => {
    const filePath = path.resolve(buildConfig.OUTPUT, 'foo.js')

    try {
        fs.mkdirSync(buildConfig.OUTPUT)
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
