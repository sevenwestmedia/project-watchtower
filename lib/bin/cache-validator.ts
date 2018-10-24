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

type CacheLoaderValidationFile = { [key: string]: string }

type BuildInfo = { project: string; environment: BuildEnvironment; target: BuildTarget }

const cacheDir = process.env.CACHE_DIRECTORY || `.build-cache`
const cacheDirPath = path.join(path.resolve(cacheDir))

// default values
let validatorConfig: CacheLoaderValidation = {
    cacheValidationConfigPath: path.join(cacheDirPath, '.build-cache-validation'),
    cacheDirectory: cacheDirPath,
    validationItems: [
        { isFile: true, filePath: 'tsconfig.json', hashKey: 'tsconfigHash' },
        { isFile: true, filePath: 'package.json', hashKey: 'packageHash' },
    ],
}

export const buildCacheDirectory = (buildInfo: BuildInfo) => {
    const { project, environment, target } = buildInfo
    // Project Environment Target Folder
    const petFolder = path.join(project.replace('/', '.'), `${environment}.${target}`)
    return path.join(validatorConfig.cacheDirectory, petFolder)
}

let TRACE_MESSAGES = true

const writeFile = promisify(fs.writeFile)
const rmrf = promisify(rimraf)
const fileExists = promisify(fs.exists)

const traceLog = (log: Logger, message: string) => {
    if (TRACE_MESSAGES) {
        log.trace(message)
    }
}

const getFileContents = async (log: Logger, file: string) => {
    const readFile = promisify(fs.readFile)
    const resolvedPath = path.resolve(file)
    const exists = await fileExists(resolvedPath)
    if (exists) {
        const contents = await readFile(resolvedPath, { encoding: 'utf8' })
        traceLog(log, `[Cache-Validator] contents from ${file} is '${contents}'`)
        return contents
    }
    traceLog(log, `[Cache-Validator] file=${file} does not exist, no contents returned`)
    return null
}

const writeContents = async (
    log: Logger,
    filePath: string,
    contents: CacheLoaderValidationFile,
) => {
    const resolvedPath = path.resolve(filePath)
    const jsonStr = JSON.stringify(contents)
    traceLog(log, `[Cache-Validator] saving cacheLoaderValidation=${jsonStr}`)

    const exists = await fileExists(resolvedPath)
    if (!exists) {
        const parentDir = path.dirname(resolvedPath)
        mkdirp.sync(parentDir)
    }
    return writeFile(resolvedPath, jsonStr, { encoding: 'utf8', flag: 'w+' })
}

const clearDirectory = async (log: Logger, directory: string) => {
    const resolvedDir = path.resolve(directory)

    const exists = await fileExists(resolvedDir)
    if (exists) {
        log.info(`[Cache-Validator] Clearing => ${resolvedDir}`)
    } else {
        log.info(`[Cache-Validator] ${resolvedDir} not cleared (Does not exist)`)
    }
    return rmrf(resolvedDir)
}

const getMd5OfFile = async (log: Logger, key: string, file: string) => {
    const tsConfig = await getFileContents(log, file)
    if (tsConfig) {
        const md5Hash = md5(tsConfig)
        traceLog(log, `[Cache-Validator] md5 hash for file=${key} contents -> ${md5Hash}`)
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
    const cacheLoaderValidation = await getFileContents(
        log,
        validatorConfig.cacheValidationConfigPath,
    )
    if (cacheLoaderValidation) {
        const config: CacheLoaderValidationFile = JSON.parse(cacheLoaderValidation)

        if (validatorConfig.validationItems.length > 0) {
            let result = false
            await Promise.all(
                validatorConfig.validationItems.map(async validationItem => {
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
                log.info(`[Cache-Validator] No mismatches found`)
            }
            return result
        }
    }
    log.info(`[Cache-Validator] validation file not found, one will be created`)
    return true
}

const writeValidationConfig = async (log: Logger) => {
    const configToWrite: CacheLoaderValidationFile = {}
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
    return writeContents(log, validatorConfig.cacheValidationConfigPath, configToWrite)
}

/**
 * Determines if the build cache should be cleared if the ts config has changed.
 */
export const validateCache = async (
    log: Logger,
    buildInfo: BuildInfo | null,
    extraValidationItems: ValidationItem[],
    showTraceMessages: boolean = true,
) => {
    if (!showTraceMessages) {
        TRACE_MESSAGES = showTraceMessages
    }

    if (buildInfo) {
        const { project, environment, target } = buildInfo

        // Project Environment Target Folder
        const petFolder = path.join(project.replace('/', '.'), `${environment}.${target}`)

        const cacheDirectory = path.join(validatorConfig.cacheDirectory, petFolder)

        // Update config due to petFolder (pet = project environment target)
        configure(log, {
            cacheDirectory,
            cacheValidationConfigPath: path.join(cacheDirectory, '.build-cache-validation'),
            validationItems: [...validatorConfig.validationItems, ...extraValidationItems],
        })
    }

    log.info(`[Cache-Validator] cacheDirectory=${validatorConfig.cacheDirectory}`)

    const clear = await shouldClearCache(log)
    if (clear) {
        await clearDirectory(log, validatorConfig.cacheDirectory)
        await writeValidationConfig(log)
    }
}

export const configure = (log: Logger, newConfig: CacheLoaderValidation) => {
    validatorConfig = {
        cacheValidationConfigPath:
            newConfig.cacheValidationConfigPath || validatorConfig.cacheValidationConfigPath,
        cacheDirectory: newConfig.cacheDirectory || validatorConfig.cacheDirectory,
        validationItems: newConfig.validationItems || validatorConfig.validationItems,
    }
    traceLog(log, `[Cache-Validator] validatorConfig=${JSON.stringify(validatorConfig)}`)
}

export const writeDummyConfigFile = async (
    log: Logger,
    file: string,
    config: CacheLoaderValidationFile,
) => {
    const contents = JSON.stringify(config)
    traceLog(log, `[Cache-Validator] writing dummy config ${file} with contents ${contents}`)
    return writeFile(file, contents, 'utf8')
}

export const writeDummyFile = async (log: Logger, file: string, contents: string) => {
    traceLog(log, `[Cache-Validator] writing dummy file ${file} with contents ${contents}`)
    return writeFile(file, contents, 'utf8')
}

export const deletePath = async (log: Logger, fileOrDir: string) => {
    const resolved = path.resolve(fileOrDir)
    traceLog(log, `[Cache-Validator] rmrf ${resolved}`)
    return rmrf(resolved)
}
