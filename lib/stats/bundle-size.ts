import * as fs from 'fs'
import * as path from 'path'
import CONFIG from '../runtime/config/config'
import { log, logError, prettyJson } from '../runtime/util/log'
import { BuildMetrics } from './'
import { getFileSize, readFile, formatFileSize } from '../runtime/util/fs'

const { BASE, SERVER_PUBLIC_DIR } = CONFIG
const assetFilePath = path.resolve(BASE, 'assets.json')

const getAbsoluteChunkPath = (chunkPath: string) => {
    const normalizedChunkPath = chunkPath[0] === '/'
        ? chunkPath.slice(1)
        : chunkPath

    return path.resolve(SERVER_PUBLIC_DIR, normalizedChunkPath)
}

const getChunkSize = async (chunkPath: string) => {
    const absolutePath = getAbsoluteChunkPath(chunkPath)
    const size = await getFileSize(absolutePath)
    return formatFileSize(size)
}

const getCombinedSize = (assetsDir: string) =>
    new Promise<string>((resolve, reject) => {
        fs.readdir(assetsDir, (err, files) => {
            if (err) {
                logError('Error reading the assets directory', err)
                reject(err)
                return
            }

            const filePromises = files
                .filter((file) => /\.js$/.test(file))
                .map((file) => getFileSize(path.resolve(assetsDir, file)))

            Promise.all(filePromises)
                .then((fileStats) => {
                    const combinedSize: number = fileStats.reduce(
                        (prev: number, cur: number) => prev + cur, 0)
                    resolve(formatFileSize(combinedSize))
                })
                .catch((reason) => reject(reason))
        })
    })

const bundleSize = async () => {
    try {
        const assetFile = await readFile(assetFilePath)
        const assets = JSON.parse(assetFile)
        const assetsDir = path.dirname(getAbsoluteChunkPath(assets.main.js))

        const values = await Promise.all([
            getCombinedSize(assetsDir),
            getChunkSize(assets.main.js),
            getChunkSize(assets.vendor.js),
            getChunkSize(assets.main.css),
        ])

        const stats: BuildMetrics = {
            bundle_size_total: values[0],
            bundle_size_main: values[1],
            bundle_size_vendor: values[2],
            bundle_size_css: values[3],
        }

        log(`Bundle size: ${prettyJson(stats)}`)

        return stats
    } catch (e) {
        logError('Error measuring bundle sizes')
        return {}
    }
}

export default bundleSize
