import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import { consoleLogger } from 'typescript-log'
import { clean } from '@project-watchtower/cli'
import { getBuildConfig } from '@project-watchtower/server'

const log = consoleLogger()
const buildConfig = getBuildConfig(log, process.cwd())
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
