import {
    validateCache,
    configure,
    writeDummyFile,
    writeDummyConfigFile,
    deletePath,
    // buildCacheDirectory,
} from '../../lib/bin/cache-validator'
import { createConsoleLogger } from '../../lib/runtime/universal'
import mkdirp from 'mkdirp'
import fs from 'fs'
import path from 'path'
// import { BuildEnvironment, BuildTarget } from 'lib'

const log = createConsoleLogger()

const TS_CONFIG_PATH = __dirname + '/tsconfig.json'
const TEST_VALIDATION_CONFIG = __dirname + '/config.json'
const TEST_CACHE_DIR = __dirname + '/cache/'

describe('cache-validator tests', () => {
    beforeEach(async () => {
        configure(log, {
            cacheValidationConfigPath: TEST_VALIDATION_CONFIG,
            cacheDirectory: TEST_CACHE_DIR,
            validationItems: [{ isFile: true, filePath: TS_CONFIG_PATH, hashKey: 'tsConfig' }],
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
        await validateCache(log, null, [])
        const exists = fs.existsSync(TEST_CACHE_DIR)
        expect(exists).toEqual(false)
    })

    it('remove cache dir when no validation config present', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await validateCache(log, null, [])
        const exists = fs.existsSync(TEST_CACHE_DIR)
        expect(exists).toEqual(false)
    })

    it('dont remove cache dir as the tsconfig matches the validation config', async () => {
        await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
        await writeDummyConfigFile(log, path.resolve(TEST_VALIDATION_CONFIG), {
            tsConfig: '3dbe00a167653a1aaee01d93e77e730e',
        }) // the hash for aaa

        await validateCache(log, null, [])
        const cacheExists = fs.existsSync(TEST_CACHE_DIR)
        expect(cacheExists).toEqual(true)
        const cacheValidationFileExists = fs.existsSync(TEST_VALIDATION_CONFIG)
        expect(cacheValidationFileExists).toEqual(true)
    })
})

// describe('cache-validator tests - with build info', () => {
//     const buildInfo = {
//         project: 'some/project',
//         environment: 'prod' as BuildEnvironment,
//         target: 'client' as BuildTarget,
//     }

//     let cacheDirectory = ''
//     let cacheValidationConfigPath = ''

//     beforeEach(async () => {
//         configure(log, {
//             cacheValidationConfigPath: TEST_VALIDATION_CONFIG,
//             cacheDirectory: TEST_CACHE_DIR,
//             validationItems: [{ isFile: true, filePath: TS_CONFIG_PATH, hashKey: 'tsConfig' }],
//         })

//         cacheDirectory = buildCacheDirectory(buildInfo)
//         cacheValidationConfigPath = path.join(cacheDirectory, '.build-cache-validation')

//         mkdirp.sync(path.resolve(cacheDirectory))
//         await deletePath(log, cacheValidationConfigPath)
//         await deletePath(log, TS_CONFIG_PATH)
//     })

//     afterEach(async () => {
//         await deletePath(log, cacheDirectory)
//         await deletePath(log, cacheValidationConfigPath)
//         await deletePath(log, TS_CONFIG_PATH)
//     })

//     it('remove cache dir when tsconfig not present - with build info', async () => {
//         await validateCache(log, buildInfo, [])
//         log.info('dog')
//         log.info(cacheDirectory)
//         const exists = fs.existsSync(cacheDirectory)
//         expect(exists).toEqual(false)
//     })

//     it('remove cache dir when no validation config present - with build info', async () => {
//         await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
//         await validateCache(log, buildInfo, [])
//         const exists = fs.existsSync(cacheDirectory)
//         expect(exists).toEqual(false)
//     })

//     it('dont remove cache dir as the tsconfig matches the validation config - with build info', async () => {
//         await writeDummyFile(log, path.resolve(TS_CONFIG_PATH), 'aaaaaaaa')
//         await writeDummyConfigFile(log, path.join(cacheDirectory, 'config.json'), {
//             tsConfig: '3dbe00a167653a1aaee01d93e77e730e',
//         }) // the hash for aaa

//         await validateCache(log, buildInfo, [])
//         const cacheExists = fs.existsSync(cacheDirectory)
//         expect(cacheExists).toEqual(true)
//         const cacheValidationFileExists = fs.existsSync(cacheValidationConfigPath)
//         expect(cacheValidationFileExists).toEqual(true)
//     })
// })
