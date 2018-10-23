import fs from 'fs'
import md5 from 'md5'
import path from 'path'
import rimraf from 'rimraf'
import { Logger } from '../runtime/universal'
import { promisify } from 'util'

type CacheLoaderValidationConfig = {
    cacheValidationConfigPath?: string
    cacheDirectory?: string
    tsConfigPath?: string
}

// default values
let validatorConfig = {
    cacheValidationConfigPath: '.cache-validation',
    cacheDirectory: '.cache-loader',
    tsConfigPath: 'tsconfig.json',
}

let TRACE_MESSAGES = true

const writeFile = promisify(fs.writeFile)
const rmrf = promisify(rimraf)

const traceLog = (log: Logger, message: string) => {
    if (TRACE_MESSAGES) {
        log.trace(message)
    }
}

const getFileContents = async (log: Logger, file: string) => {
    const readFile = promisify(fs.readFile)
    const fileExists = promisify(fs.exists)
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

const writeContents = async (log: Logger, filePath: string, contents: CacheLoaderValidation) => {
    const resolvedPath = path.resolve(filePath)
    const jsonStr = JSON.stringify(contents)
    traceLog(log, `[Cache-Validator] saving cacheLoaderValidation=${jsonStr}`)
    return writeFile(resolvedPath, jsonStr, { encoding: 'utf8', flag: 'w+' })
}

const clearDirectory = async (log: Logger, directory: string) => {
    const resolvedDir = path.resolve(directory)
    traceLog(log, `[Cache-Validator] clearing ${resolvedDir}`)
    return rmrf(resolvedDir)
}

type CacheLoaderValidation = {
    tsConfigHash: string
}

const getMd5OfFile = async (log: Logger, file: string) => {
    const tsConfig = await getFileContents(log, file)
    if (tsConfig) {
        const md5Hash = md5(tsConfig)
        traceLog(log, `[Cache-Validator] md5 hash for contents -> ${md5Hash}`)
        return md5Hash
    }
    return null
}

const shouldClearCache = async (log: Logger) => {
    const cacheLoaderValidation = await getFileContents(
        log,
        validatorConfig.cacheValidationConfigPath,
    )
    if (cacheLoaderValidation) {
        const config: CacheLoaderValidation = JSON.parse(cacheLoaderValidation)
        const tsConfigFileHash = await getMd5OfFile(log, validatorConfig.tsConfigPath)
        if (tsConfigFileHash !== config.tsConfigHash) {
            log.info(
                `[Cache-Validator] tsConfig hashMismatch, config=${
                    config.tsConfigHash
                } file=${tsConfigFileHash}`,
            )
            return true
        } else {
            log.info(`[Cache-Validator] no change in tsConfig, cache wont be cleared`)
            return false
        }
    }
    log.info(`[Cache-Validator] No hash present for tsConfig, need to create one & clear cache`)
    return true
}

export const validateCache = async (log: Logger, showTraceMessages: boolean = true) => {
    if (!showTraceMessages) {
        TRACE_MESSAGES = showTraceMessages
    }
    const clear = await shouldClearCache(log)
    if (clear) {
        await clearDirectory(log, validatorConfig.cacheDirectory)
        const tsConfigHash = await getMd5OfFile(log, validatorConfig.tsConfigPath)
        if (tsConfigHash) {
            traceLog(log, tsConfigHash)
            return writeContents(log, validatorConfig.cacheValidationConfigPath, { tsConfigHash })
        }
    }
}

export const configure = (log: Logger, newConfig: CacheLoaderValidationConfig) => {
    validatorConfig = {
        cacheValidationConfigPath:
            newConfig.cacheValidationConfigPath || validatorConfig.cacheValidationConfigPath,
        cacheDirectory: newConfig.cacheDirectory || validatorConfig.cacheDirectory,
        tsConfigPath: newConfig.tsConfigPath || validatorConfig.tsConfigPath,
    }
    traceLog(log, `[Cache-Validator] validatorConfig=${JSON.stringify(validatorConfig)}`)
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
