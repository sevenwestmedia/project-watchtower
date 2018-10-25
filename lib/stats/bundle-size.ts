import path from 'path'
import { BuildMetrics } from './'
import { getFileSize, readFile, formatFileSize } from '../runtime/util/fs'
import { RuntimeConfig } from '../../lib'
import { Logger } from '../runtime/universal'
import { getAbsoluteAssetPath } from '../runtime/server'

const getChunkSize = async (log: Logger, runtimeConfig: RuntimeConfig, chunkPath: string) => {
    const absolutePath = getAbsoluteAssetPath(runtimeConfig, chunkPath)
    const size = await getFileSize(log, absolutePath)
    return { kb: formatFileSize(size), bytes: Math.round(size) }
}

const bundleSize = async (log: Logger, runtimeConfig: RuntimeConfig) => {
    try {
        const assetFilePath = path.resolve(runtimeConfig.BASE, 'assets.json')
        const assetFile = await readFile(log, assetFilePath)
        const assets = JSON.parse(assetFile)

        const jsAssets = Object.keys(assets)
            .filter(key => {
                return !!assets[key].js
            })
            .map(key => {
                return { js: assets[key].js as string, key }
            })

        const cssAssets = Object.keys(assets)
            .filter(key => {
                return !!assets[key].css
            })
            .map(key => {
                return { css: assets[key].css as string, key }
            })

        let totalJs = 0
        let totalCss = 0
        const values = await Promise.all([
            ...jsAssets.map(jsAsset =>
                getChunkSize(log, runtimeConfig, jsAsset.js).then(size => {
                    totalJs += size.bytes
                    return {
                        size,
                        asset: `${jsAsset.key}.js`,
                    }
                }),
            ),
            ...cssAssets.map(cssAsset =>
                getChunkSize(log, runtimeConfig, cssAsset.css).then(size => {
                    totalCss += size.bytes
                    return {
                        size,
                        asset: `${cssAsset.key}.css`,
                    }
                }),
            ),
        ])

        const stats = values.reduce<BuildMetrics>((acc, val) => {
            acc[`bundle_${val.asset}`] = val.size.bytes.toFixed(0)
            return acc
        }, {})
        stats.totalJs = totalJs.toFixed(0)
        stats.totalCss = totalCss.toFixed(0)

        log.info(stats, 'Bundle size')

        return stats
    } catch (e) {
        log.error('Error measuring bundle sizes')
        return {}
    }
}

export default bundleSize
