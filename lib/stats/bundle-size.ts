import path from 'path'
import { BuildMetrics } from './'
import { getFileSize, readFile, formatFileSize } from '../runtime/util/fs'
import { RuntimeConfig } from '../../lib'
import { Logger } from '../runtime/universal'
import { getAbsoluteAssetPath } from '../runtime/server'

const getChunkSize = async (log: Logger, runtimeConfig: RuntimeConfig, chunkPath: string) => {
    const absolutePath = getAbsoluteAssetPath(runtimeConfig, chunkPath)
    const size = await getFileSize(log, absolutePath)
    return formatFileSize(size)
}

const bundleSize = async (log: Logger, runtimeConfig: RuntimeConfig) => {
    try {
        const assetFilePath = path.resolve(runtimeConfig.BASE, 'assets.json')
        const assetFile = await readFile(log, assetFilePath)
        const assets = JSON.parse(assetFile)

        const values = await Promise.all([
            getChunkSize(log, runtimeConfig, assets.main.js),
            getChunkSize(log, runtimeConfig, assets.vendor.js),
            getChunkSize(log, runtimeConfig, assets.main.css),
        ])

        const stats: BuildMetrics = {
            bundle_size_main: values[0],
            bundle_size_vendor: values[1],
            bundle_size_css: values[2],
        }

        log.info(stats, 'Bundle size')

        return stats
    } catch (e) {
        log.error('Error measuring bundle sizes')
        return {}
    }
}

export default bundleSize
