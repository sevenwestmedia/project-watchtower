import fs from 'fs'
import md5 from 'md5'
import path from 'path'
import rimraf from 'rimraf'
import { Logger } from '../runtime/universal'
import { promisify } from 'util'
import mkdirp from 'mkdirp'
import { BuildEnvironment, BuildTarget } from '../../lib/types'

type ValidationItem =
    | {
          isFile: true
          filePath: string
          hashKey: string
      }
    | { isFile: false; itemHash: string; hashKey: string }

type CacheLoaderValidation = {
    cacheValidationConfigPath: string
    cacheDirectory: string
    validationItems: ValidationItem[]
}

type CacheLoaderValidationFile = { [key: string]: string | boolean; cacheCleared: boolean }

type BuildInfo = { project: string; environment: BuildEnvironment; target: BuildTarget }

// Configure Variables
const cacheDir = process.env.CACHE_DIRECTORY || `.build-cache`
const cacheDirPath = path.join(path.resolve(cacheDir))
const tsConfigPath = 'tsconfig.json'
const buildCacheValidationConfig = '.build-cache-validation'

export const TSCONFIG_VALIDATION_ITEM: ValidationItem = {
    isFile: true,
    filePath: tsConfigPath,
    hashKey: 'tsconfigHash',
}

// default values
const validatorConfig: CacheLoaderValidation & {
    baseCacheDirectory: string
} = {
    cacheValidationConfigPath: path.join(cacheDirPath, buildCacheValidationConfig),
    baseCacheDirectory: cacheDirPath,
    cacheDirectory: cacheDirPath,
    validationItems: [TSCONFIG_VALIDATION_ITEM],
}

let TRACE_MESSAGES = true

const traceLog = (log: Logger, message: string) => {
    if (TRACE_MESSAGES) {
        log.trace(message)
    }
}

export const setup = (
    log: Logger,
    options: {
        cacheDirectory?: string
        validationItems?: ValidationItem[]
        valiationConfigPath?: string
        traceMessages?: boolean
    },
) => {
    const { cacheDirectory, validationItems, valiationConfigPath, traceMessages } = options

    if (traceMessages !== undefined) {
        TRACE_MESSAGES = traceMessages
    }

    if (cacheDirectory) {
        validatorConfig.cacheDirectory = cacheDirectory
        validatorConfig.baseCacheDirectory = cacheDirectory
    }
    if (validationItems) {
        validatorConfig.validationItems = validationItems
    }
    if (valiationConfigPath) {
        validatorConfig.cacheValidationConfigPath = valiationConfigPath
    }
    traceLog(log, `[Cache-Validator] validatorConfig => ${JSON.stringify(validatorConfig)}`)
    return validatorConfig
}

export const setupWithBuildInfo = (
    log: Logger,
    options: {
        cacheDirectory?: string
        validationItems?: ValidationItem[]
        buildInfo: BuildInfo
        traceMessages?: boolean
    },
) => {
    const { cacheDirectory, buildInfo, validationItems, traceMessages } = options
    const { project, environment, target } = buildInfo

    if (traceMessages !== undefined) {
        TRACE_MESSAGES = traceMessages
    }

    if (cacheDirectory) {
        validatorConfig.cacheDirectory = cacheDirectory
        validatorConfig.baseCacheDirectory = cacheDirectory
    }

    // Project Environment Target Folder
    const petFolder = path.join(project.replace('/', '.'), `${environment}.${target}`)
    const newCacheDir = path.join(validatorConfig.baseCacheDirectory, petFolder)
    // Update config due to petFolder (pet = project environment target)

    validatorConfig.cacheDirectory = newCacheDir
    validatorConfig.cacheValidationConfigPath = path.join(newCacheDir, '.build-cache-validation')

    if (validationItems) {
        validatorConfig.validationItems = validationItems
    }
    traceLog(log, `[Cache-Validator] validatorConfig => ${JSON.stringify(validatorConfig)}`)
    return validatorConfig
}

export const buildCacheDirectory = (buildInfo: BuildInfo) => {
    const { project, environment, target } = buildInfo
    // Project Environment Target Folder
    const petFolder = path.join(project.replace('/', '.'), `${environment}.${target}`)
    return path.join(validatorConfig.baseCacheDirectory, petFolder)
}

const writeFile = promisify(fs.writeFile)
const rmrf = promisify(rimraf)
const fileExists = promisify(fs.exists)

const getFileContents = async (log: Logger, filePath: string) => {
    const readFile = promisify(fs.readFile)
    const exists = await fileExists(filePath)
    if (exists) {
        const contents = await readFile(filePath, { encoding: 'utf8' })
        traceLog(log, `[Cache-Validator] contents from ${filePath} is '${contents}'`)
        return contents
    }
    traceLog(log, `[Cache-Validator] ${filePath} does not exist, no contents returned`)
    return null
}

export const getConfigContents = async (log: Logger, configFilePath: string) => {
    const result = await getFileContents(log, configFilePath)
    if (result) {
        const cast: CacheLoaderValidationFile = JSON.parse(result)
        return cast
    }
    return null
}

const writeContents = async (
    log: Logger,
    filePath: string,
    contents: CacheLoaderValidationFile,
) => {
    const jsonStr = JSON.stringify(contents)
    traceLog(log, `[Cache-Validator] saving cacheLoaderValidation =>${jsonStr}`)

    const exists = await fileExists(filePath)
    if (!exists) {
        const parentDir = path.dirname(filePath)
        mkdirp.sync(parentDir)
    }
    await writeFile(filePath, jsonStr, { encoding: 'utf8', flag: 'w+' })
}

export const deletePath = async (log: Logger, fileOrDir: string) => {
    traceLog(log, `[Cache-Validator] rmrf ${fileOrDir}`)
    await rmrf(fileOrDir)
}

const clearDirectory = async (log: Logger, directory: string) => {
    const exists = await fileExists(directory)
    if (exists) {
        log.info(`[Cache-Validator] Clearing => ${directory}`)
    } else {
        log.info(`[Cache-Validator] ${directory} not cleared (Does not exist)`)
    }
    await deletePath(log, directory)
}

const getMd5OfFile = async (log: Logger, key: string, file: string) => {
    const tsConfig = await getFileContents(log, file)
    if (tsConfig) {
        const md5Hash = md5(tsConfig)
        traceLog(log, `[Cache-Validator] md5 hash for file => ${key} contents -> ${md5Hash}`)
        return md5Hash
    }
    return null
}

export const getMd5 = async (log: Logger, key: string, item: string) => {
    const md5Hash = md5(item)
    log.info(`[Cache-Validator] md5 hash for ${key} -> ${md5Hash}`)
    return md5Hash
}

const shouldClearCache = async (log: Logger) => {
    const cacheLoaderValidation = await getConfigContents(
        log,
        validatorConfig.cacheValidationConfigPath,
    )
    if (cacheLoaderValidation) {
        const config: CacheLoaderValidationFile = cacheLoaderValidation

        if (validatorConfig.validationItems.length > 0) {
            let result = false
            await Promise.all(
                validatorConfig.validationItems.map(async validationItem => {
                    traceLog(
                        log,
                        `[Cache-Validator] processing validation Item ${JSON.stringify(
                            validationItem,
                        )}`,
                    )
                    const hash = validationItem.isFile
                        ? await getMd5OfFile(log, validationItem.hashKey, validationItem.filePath)
                        : validationItem.itemHash

                    if (hash !== config[validationItem.hashKey]) {
                        log.info(
                            `[Cache-Validator] ${validationItem.hashKey} hashMismatch, config=${
                                config[validationItem.hashKey]
                            } ${validationItem.isFile ? 'file' : 'object'}=${hash}`,
                        )
                        result = true
                    }
                }),
            )
            if (!result) {
                log.info(`[Cache-Validator] No mismatches found - cache not cleared`)
                config.cacheCleared = false
                await writeContents(log, validatorConfig.cacheValidationConfigPath, config)
            }
            return result
        }
    }
    traceLog(
        log,
        `[Cache-Validator] ${validatorConfig.cacheValidationConfigPath} not found (Does not exist)`,
    )
    return true
}

const createValidationConfig = async (log: Logger, cacheCleared: boolean) => {
    const configToWrite: CacheLoaderValidationFile = { cacheCleared }
    await Promise.all(
        validatorConfig.validationItems.map(async validationItem => {
            const hashValue = validationItem.isFile
                ? await getMd5OfFile(log, validationItem.hashKey, validationItem.filePath)
                : validationItem.itemHash

            if (hashValue) {
                configToWrite[validationItem.hashKey] = hashValue
            }
        }),
    )
    log.info(
        `[Cache-Validator] writing config file => ${validatorConfig.cacheValidationConfigPath}`,
    )
    await writeContents(log, validatorConfig.cacheValidationConfigPath, configToWrite)
}

/**
 * Determines if the build cache should be cleared if the ts config has changed.
 */
export const validateCache = async (log: Logger) => {
    log.info(`[Cache-Validator] cacheDirectory => ${validatorConfig.cacheDirectory}`)

    const clear = await shouldClearCache(log)
    if (clear) {
        await clearDirectory(log, validatorConfig.cacheDirectory)
        await createValidationConfig(log, true)
    }
}

export const writeDummyConfigFile = async (
    log: Logger,
    file: string,
    config: CacheLoaderValidationFile,
) => {
    const contents = JSON.stringify(config)
    traceLog(log, `[Cache-Validator] writing dummy config ${file} with contents ${contents}`)
    await writeFile(file, contents, 'utf8')
}

export const writeDummyFile = async (log: Logger, file: string, contents: string) => {
    traceLog(log, `[Cache-Validator] writing dummy file ${file} with contents ${contents}`)
    await writeFile(file, contents, 'utf8')
}
