import * as fs from 'fs'
import * as path from 'path'
import { logError } from './log'

export const readFile = (filePath: string) => (
    new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                logError('Error reading file', filePath, err)
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
)

export const getFileSize = (filePath: string) => (
    new Promise<number>((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                logError('Error getting file size', filePath, err)
                reject(err)
            } else {
                resolve(stats.size)
            }
        })
    })
)

export const writeFile = (filePath: string, fileContent: string) => (
    new Promise((resolve, reject) => {
        fs.writeFile(filePath, fileContent, (err) => {
            if (err) {
                logError('Error writing file', err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
)

export const formatFileSize = (size: number) => (size / 1024).toFixed(1)

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
export const getCustomConfigFile = <T extends {}>(filePath: string, fallback: T): T => {
    const root = process.cwd()
    const customConfigFile = path.resolve(root, filePath + '.js')
    const customConfigFileTS = path.resolve(root, filePath + '.ts')

    if (existsSync(customConfigFile)) {
        // using dynamicRequire to support bundling project-watchtower with webpack
        return dynamicRequire(customConfigFile).default
    }

    if (existsSync(customConfigFileTS)) {
        logError(filePath + ' only found as TypeScript file.')
        logError('Please make sure to compile all TS files in the /config folder to JS!')
        process.exit(1)
    }

    return fallback
}
