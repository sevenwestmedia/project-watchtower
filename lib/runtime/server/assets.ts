import * as fs from 'fs'
import * as path from 'path'
import { Assets } from '../../types'
import { BuildConfig } from '../../../lib'

let assets: Assets

let assetsLoaded = false

const getAssetsFile = (buildConfig: BuildConfig) => path.resolve(buildConfig.BASE, 'assets.json')

const ensureAssets = (buildConfig: BuildConfig) => {
    if (assetsLoaded) {
        return
    }
    try {
        const assetsFileContents = fs.readFileSync(getAssetsFile(buildConfig))
        assets = JSON.parse(assetsFileContents.toString())
        assetsLoaded = true
    } catch (e) {
        // do nothing
        // Create defaults
        assets = {
            main: {
                js: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'js/main.js',
                css: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'css/main.css',
            },
            vendor: {
                js: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'js/vendor.js',
            },
        }
    }
}

const watchMode = process.env.START_WATCH_MODE === 'true'

export const updateAssetLocations = (newAssets: Assets) => {
    assets = newAssets
    assetsLoaded = true
}

export const getAssetLocations = (buildConfig: BuildConfig) => {
    ensureAssets(buildConfig)
    return assets
}

/**
 * Returns a HTML snippet for all CSS assets
 * We add the timestamp in watch mode to support hot reloading with the ExtractTextWebpackPlugin
 */
export const getCssAssetHtml = (buildConfig: BuildConfig) => {
    ensureAssets(buildConfig)
    return `<link rel="stylesheet" type="text/css" id="css-main" href="${assets.main.css}${watchMode
        ? '?' + Date.now()
        : ''}" />`
}

/** Returns a HTML snippet for all JavaScript assets */
export const getJsAssetHtml = (buildConfig: BuildConfig) => {
    ensureAssets(buildConfig)
    return `<script src="${assets.vendor.js}"></script>
    <script src="${assets.main.js}" async></script>`
}

/** Inserts all assets into a given HTML document string */
export const addAssetsToHtml = (buildConfig: BuildConfig, html: string) => {
    ensureAssets(buildConfig)
    let modifiedHtml = html

    if (html.indexOf(assets.main.css) === -1) {
        modifiedHtml = modifiedHtml.replace('</head>', getCssAssetHtml(buildConfig) + '</head>')
    }
    if (html.indexOf(assets.main.js) === -1) {
        modifiedHtml = modifiedHtml.replace('</body>', getJsAssetHtml(buildConfig) + '</body>')
    }
    return modifiedHtml
}

export const getAbsoluteAssetPath = (buildConfig: BuildConfig, asset: string) => {
    let relativeAsset = asset.slice(buildConfig.PUBLIC_PATH.length)
    if (relativeAsset[0] === '/') {
        relativeAsset = relativeAsset.slice(1)
    }

    return path.resolve(buildConfig.CLIENT_OUTPUT, relativeAsset)
}
