import * as fs from 'fs'
import { logError } from '../__util/log'

export const formatFileSize = (size: number) => (size / 1024).toFixed(1)

export const formatTimeMs = (ms: number) => ms.toFixed(0)

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
                logError('Error writing build-stats.csv:', err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
)

export const getTimeMs = () => {
    const hrtime = process.hrtime()
    return hrtime[0] * 1000 + hrtime[1] / 1000000
}

export const delay = (ms = 1000) =>
    new Promise((resolve) => setTimeout(() => resolve(), ms))

export const average = (nums: number[]) =>
    nums.reduce((prev, cur) => prev + cur, 0) / nums.length

export async function getSequenceAverage(fn: () => Promise<number>, times = 5) {
    const results: number[] = []

    for (let i = 0; i < times; i++) {
        try {
            const nextResult = await fn()
            results.push(nextResult)
        } catch (e) {
            logError('getSequenceAverage error: ', e)
        }
        await delay(1000)
    }

    return average(results)
}
