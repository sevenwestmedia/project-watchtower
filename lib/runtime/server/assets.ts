import * as fs from 'fs'
import * as path from 'path'
import { Assets } from '../../types'
import { BuildConfig } from '../../../lib'
import { getConfig } from '../../../lib/runtime/config/config'
import { getBaseDir } from '../../../lib/runtime/server/base-dir'

let assets: Assets

let assetsLoaded = false

const getAssetsFile = (buildConfig: BuildConfig) => path.resolve(buildConfig.BASE, 'assets.json')

const ensureAssets = () => {
    const buildConfig = getConfig(getBaseDir())
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

export const getAssetLocations = () => {
    ensureAssets()
    return assets
}

/**
 * Returns a HTML snippet for all CSS assets
 * We add the timestamp in watch mode to support hot reloading with the ExtractTextWebpackPlugin
 */
export const getCssAssetHtml = () => {
    ensureAssets()
    return `<link rel="stylesheet" type="text/css" id="css-main" href="${assets.main.css}${watchMode
        ? '?' + Date.now()
        : ''}" />`
}

/** Returns a HTML snippet for all JavaScript assets */
export const getJsAssetHtml = () => {
    ensureAssets()
    return `<script src="${assets.vendor.js}"></script>
    <script src="${assets.main.js}" async></script>`
}

/** Inserts all assets into a given HTML document string */
export const addAssetsToHtml = (html: string) => {
    ensureAssets()
    let modifiedHtml = html

    if (html.indexOf(assets.main.css) === -1) {
        modifiedHtml = modifiedHtml.replace('</head>', getCssAssetHtml() + '</head>')
    }
    if (html.indexOf(assets.main.js) === -1) {
        modifiedHtml = modifiedHtml.replace('</body>', getJsAssetHtml() + '</body>')
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
