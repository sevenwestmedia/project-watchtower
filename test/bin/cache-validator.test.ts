import { validateCache, configure, writeDummyFile, deletePath } from '../../lib/bin/cache-validator'
import { createConsoleLogger } from '../../lib/runtime/universal'
import mkdirp from 'mkdirp'
import fs from 'fs'
import path from 'path'

const log = createConsoleLogger()

const TEST_VALIDATION_CONFIG = __dirname + '/config.json'
const TEST_CACHE_DIR = __dirname + '/cache/'
const TS_CONFIG_PATH = __dirname + '/testfile.json'

describe('cache-validator tests', () => {
    beforeEach(async () => {
        configure(log, {
            cacheValidationConfigPath: TEST_VALIDATION_CONFIG,
            cacheDirectory: TEST_CACHE_DIR,
            tsConfigPath: TS_CONFIG_PATH,
        })
        mkdirp.sync(path.resolve(TEST_CACHE_DIR))
        await deletePath(log, TEST_VALIDATION_CONFIG)
        await deletePath(log, TS_CONFIG_PATH)
    })

    afterEach(async () => {
        await deletePath(log, TEST_CACHE_DIR)
        await deletePath(log, TEST_VALIDATION_CONFIG)
        await deletePath(log, TS_CONFIG_PATH)
    })

    it('remove cache dir when tsconfig not present', async () => {
        await validateCache(log)
        const exists = fs.existsSync(TEST_CACHE_DIR)
        expect(exists).toEqual(false)
    })

    it('remove cache dir when no validation config present', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await validateCache(log)
        const exists = fs.existsSync(TEST_CACHE_DIR)
        expect(exists).toEqual(false)
    })

    it('dont remove cache dir as the tsconfig matches the validation config', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await writeDummyFile(
            log,
            path.resolve(TEST_VALIDATION_CONFIG),
            JSON.stringify({ tsConfigHash: '3dbe00a167653a1aaee01d93e77e730e' }), // the hash for aaa
        )
        await validateCache(log)
        const cacheExists = fs.existsSync(TEST_CACHE_DIR)
        expect(cacheExists).toEqual(true)
        const cacheValidationFileExists = fs.existsSync(TEST_VALIDATION_CONFIG)
        expect(cacheValidationFileExists).toEqual(true)
    })
})
