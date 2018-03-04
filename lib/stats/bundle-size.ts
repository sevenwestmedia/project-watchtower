import * as fs from 'fs'
import * as path from 'path'
import { log, logError, prettyJson } from '../util/log'
import { BuildMetrics } from './'
import { getFileSize, readFile, formatFileSize } from '../runtime/util/fs'
import { getAbsoluteAssetPath } from '../runtime/server/assets'
import { BuildConfig } from '../../lib'

const getChunkSize = async (buildConfig: BuildConfig, chunkPath: string) => {
    const absolutePath = getAbsoluteAssetPath(buildConfig, chunkPath)
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
                .filter(file => /\.js$/.test(file))
                .map(file => getFileSize(path.resolve(assetsDir, file)))

            Promise.all(filePromises)
                .then(fileStats => {
                    const combinedSize: number = fileStats.reduce(
                        (prev: number, cur: number) => prev + cur,
                        0,
                    )
                    resolve(formatFileSize(combinedSize))
                })
                .catch(reason => reject(reason))
        })
    })

const bundleSize = async (buildConfig: BuildConfig) => {
    try {
        const assetFilePath = path.resolve(buildConfig.BASE, 'assets.json')
        const assetFile = await readFile(assetFilePath)
        const assets = JSON.parse(assetFile)
        const assetsDir = path.dirname(getAbsoluteAssetPath(buildConfig, assets.main.js))

        const values = await Promise.all([
            getCombinedSize(assetsDir),
            getChunkSize(buildConfig, assets.main.js),
            getChunkSize(buildConfig, assets.vendor.js),
            getChunkSize(buildConfig, assets.main.css),
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
