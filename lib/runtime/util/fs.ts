/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable no-var */
import fs from 'fs'
import path from 'path'
import { Logger } from 'typescript-log'

export const readFileSync = (log: Logger, filePath: string) => {
    try {
        return fs.readFileSync(filePath, 'utf8')
    } catch (err) {
        log.error({ err, filePath }, 'Error reading file')
        throw err
    }
}

export const readFile = (log: Logger, filePath: string) =>
    new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                log.error({ err, filePath }, 'Error reading file')
                reject(err)
            } else {
                resolve(data)
            }
        })
    })

export const getFileSize = (log: Logger, filePath: string) =>
    new Promise<number>((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                log.error({ err, filePath }, 'Error getting file size')
                reject(err)
            } else {
                resolve(stats.size)
            }
        })
    })

export const writeFile = (log: Logger, filePath: string, fileContent: string) =>
    new Promise((resolve, reject) => {
        fs.writeFile(filePath, fileContent, err => {
            if (err) {
                log.error({ err, filePath }, 'Error writing file')
                reject(err)
            } else {
                resolve()
            }
        })
    })

export const formatFileSize = (size: number) => (size / 1024).toFixed(4)

export const existsSync = (file: string) => {
    try {
        fs.accessSync(file)
        return true
    } catch (ex) {
        return false
    }
}

declare var __non_webpack_require__: any | undefined

/**
 * Dynamically require a file in a way that works both in node and from a webpack bundle
 */
export const dynamicRequire = (file: string) => {
    if (typeof __non_webpack_require__ !== 'undefined') {
        return __non_webpack_require__(file)
    } else {
        // apparently just wrapping require() in a function is enough
        // to make webpack not try and bundle complete directories.
        // without the presence of above __non_webpack_require__ it would however emit a warning
        // "Critical dependency: the request of a dependency is an expression"
        return require(file)
    }
}

/**
 * Get custon config file if it exists as JavaScript
 * Abort with an error if it only exists as TypeScript
 * @param filePath File path from project root (without extension)
 */
export const getCustomConfigFile = <T extends {}>(
    log: Logger,
    root: string,
    filePath: string,
    fallback: T,
): T => {
    const customConfigFile = path.resolve(root, filePath + '.js')
    const customConfigFileTS = path.resolve(root, filePath + '.ts')

    if (existsSync(customConfigFile)) {
        // using dynamicRequire to support bundling project-watchtower with webpack
        const config = dynamicRequire(customConfigFile).default
        if (typeof config === 'function') {
            return config(root)
        }
        return config
    }

    // We don't dynamically compile because that would add more runtime
    // dependencies to watchtower.
    if (existsSync(customConfigFileTS)) {
        log.error(filePath + ' only found as TypeScript file.')
        log.error('Please make sure to compile all TS files in the /config folder to JS!')
        process.exit(1)
    }

    return fallback
}
