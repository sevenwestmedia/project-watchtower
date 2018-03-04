import * as fs from 'fs'
import * as path from 'path'
import { BuildMetrics } from './'
import { getFileSize, readFile, formatFileSize } from '../runtime/util/fs'
import { getAbsoluteAssetPath } from '../runtime/server/assets'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const getChunkSize = async (log: Logger, buildConfig: BuildConfig, chunkPath: string) => {
    const absolutePath = getAbsoluteAssetPath(buildConfig, chunkPath)
    const size = await getFileSize(log, absolutePath)
    return formatFileSize(size)
}

const getCombinedSize = (log: Logger, assetsDir: string) =>
    new Promise<string>((resolve, reject) => {
        fs.readdir(assetsDir, (err, files) => {
            if (err) {
                log.error({ err }, 'Error reading the assets directory')
                reject(err)
                return
            }

            const filePromises = files
                .filter(file => /\.js$/.test(file))
                .map(file => getFileSize(log, path.resolve(assetsDir, file)))

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

const bundleSize = async (log: Logger, buildConfig: BuildConfig) => {
    try {
        const assetFilePath = path.resolve(buildConfig.BASE, 'assets.json')
        const assetFile = await readFile(log, assetFilePath)
        const assets = JSON.parse(assetFile)
        const assetsDir = path.dirname(getAbsoluteAssetPath(buildConfig, assets.main.js))

        const values = await Promise.all([
            getCombinedSize(log, assetsDir),
            getChunkSize(log, buildConfig, assets.main.js),
            getChunkSize(log, buildConfig, assets.vendor.js),
            getChunkSize(log, buildConfig, assets.main.css),
        ])

        const stats: BuildMetrics = {
            bundle_size_total: values[0],
            bundle_size_main: values[1],
            bundle_size_vendor: values[2],
            bundle_size_css: values[3],
        }

        log.info(stats, 'Bundle size')

        return stats
    } catch (e) {
        log.error('Error measuring bundle sizes')
        return {}
    }
}

export default bundleSize
