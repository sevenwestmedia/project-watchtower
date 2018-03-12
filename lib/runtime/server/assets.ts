import * as fs from 'fs'
import * as path from 'path'
import { Assets } from '../../types'
import { RuntimeConfig, BuildConfig } from '../../../lib'

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

export const setDefaultAssets = (buildConfig: BuildConfig) => {
    // When running in dev mode, we don't use assets.json so we need to prime
    // the assets location
    updateAssetLocations({
        main: {
            js: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'js/main.js',
            css: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'css/main.css',
        },
        vendor: {
            js: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'js/vendor.js',
        },
    })
}

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
    const staticPath = runtimeConfig.PUBLIC_PATH + runtimeConfig.ASSETS_PATH_PREFIX
    let relativeAsset = asset.slice(staticPath.length)
    if (relativeAsset[0] === '/') {
        relativeAsset = relativeAsset.slice(1)
    }

    return path.resolve(runtimeConfig.ASSETS_PATH, relativeAsset)
}
