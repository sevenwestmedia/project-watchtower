import * as fs from 'fs'
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
