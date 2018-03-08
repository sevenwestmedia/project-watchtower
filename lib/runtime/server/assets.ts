import * as fs from 'fs'
import * as path from 'path'
import { Assets } from '../../types'
import { RuntimeConfig } from '../../../lib'

let assets: Assets

let assetsLoaded = false

export const getAssetsFile = (base: string) => path.resolve(base, 'assets.json')

const ensureAssets = (runtimeConfig: RuntimeConfig) => {
    if (assetsLoaded) {
        return
    }
    const assetsFile = getAssetsFile(runtimeConfig.BASE)
    try {
        const assetsFileContents = fs.readFileSync(assetsFile)
        assets = JSON.parse(assetsFileContents.toString())
        assetsLoaded = true
    } catch (e) {
        throw new Error(`Cannot read assets file from ${assetsFile}`)
    }
}

const watchMode = process.env.START_WATCH_MODE === 'true'

export const updateAssetLocations = (newAssets: Assets) => {
    assets = newAssets
    assetsLoaded = true
}

export const getAssetLocations = (runtimeConfig: RuntimeConfig) => {
    ensureAssets(runtimeConfig)
    return assets
}

/**
 * Returns a HTML snippet for all CSS assets
 * We add the timestamp in watch mode to support hot reloading with the ExtractTextWebpackPlugin
 */
export const getCssAssetHtml = (runtimeConfig: RuntimeConfig) => {
    ensureAssets(runtimeConfig)
    return `<link rel="stylesheet" type="text/css" id="css-main" href="${assets.main.css}${watchMode
        ? '?' + Date.now()
        : ''}" />`
}

/** Returns a HTML snippet for all JavaScript assets */
export const getJsAssetHtml = (runtimeConfig: RuntimeConfig) => {
    ensureAssets(runtimeConfig)
    return `<script src="${assets.vendor.js}"></script>
    <script src="${assets.main.js}" async></script>`
}

/** Inserts all assets into a given HTML document string */
export const addAssetsToHtml = (html: string, runtimeConfig: RuntimeConfig) => {
    ensureAssets(runtimeConfig)
    let modifiedHtml = html

    if (html.indexOf(assets.main.css) === -1) {
        modifiedHtml = modifiedHtml.replace('</head>', getCssAssetHtml(runtimeConfig) + '</head>')
    }
    if (html.indexOf(assets.main.js) === -1) {
        modifiedHtml = modifiedHtml.replace('</body>', getJsAssetHtml(runtimeConfig) + '</body>')
    }
    return modifiedHtml
}

export const getAbsoluteAssetPath = (runtimeConfig: RuntimeConfig, asset: string) => {
    let relativeAsset = asset.slice(runtimeConfig.ASSETS_PATH.length)
    if (relativeAsset[0] === '/') {
        relativeAsset = relativeAsset.slice(1)
    }

    return path.resolve(runtimeConfig.ASSETS_PATH, relativeAsset)
}
