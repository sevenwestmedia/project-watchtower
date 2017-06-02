import * as fs from 'fs'
import * as path from 'path'
import CONFIG from '../config/config'
import { Assets } from '../../types'

const root = process.cwd()
const assetsFile = path.resolve(root, 'assets.json')
const watchMode = process.env.START_WATCH_MODE === 'true'
const { PUBLIC_PATH, ASSETS_PATH_PREFIX } = CONFIG

let assets: Assets = {
    main: {
        js: PUBLIC_PATH + ASSETS_PATH_PREFIX + 'js/main.js',
        css: PUBLIC_PATH + ASSETS_PATH_PREFIX + 'css/main.css',
    },
    vendor: {
        js: PUBLIC_PATH + ASSETS_PATH_PREFIX + 'js/vendor.js',
    },
}

let assetsLoaded = false

const ensureAssets = () => {
    if (assetsLoaded) {
        return
    }
    try {
        const assetsFileContents = fs.readFileSync(assetsFile)
        assets = JSON.parse(assetsFileContents.toString())
        assetsLoaded = true
    } catch (e) {
        // do nothing
    }
}

export const updateAssetLocations = (newAssets: Assets) => {
    assets = newAssets
    assetsLoaded = true
}

export const getAssetLocations = () => {
    ensureAssets()
    return assets
}

/** Returns a HTML snippet for all CSS assets */
export const getCssAssetHtml = () => {
    ensureAssets()
    return `<link rel="stylesheet" type="text/css" id="css-main" href="${assets.main.css}${watchMode
        ? '?' + Date.now()
        : ''
    }" />`
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
        modifiedHtml = modifiedHtml.replace(
            '</head>',
            getCssAssetHtml() + '</head>',
        )
    }
    if (html.indexOf(assets.main.js) === -1) {
        modifiedHtml = modifiedHtml.replace(
            '</body>',
            getJsAssetHtml() + '</body>',
        )
    }
    return modifiedHtml
}
