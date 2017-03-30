import * as fs from 'fs'
import * as path from 'path'
import CONFIG from '../build/config/config'
import { logError } from '../__util/log'
import { Assets } from '../types'

const root = process.cwd()
const assetsFile = path.resolve(root, 'assets.json')
const watchMode = process.env.START_WATCH_MODE === 'true'
const { PUBLIC_PATH } = CONFIG

let assets: Assets = {
    main: {
        js: PUBLIC_PATH + 'main.js',
        css: PUBLIC_PATH + 'main.css',
    },
    vendor: {
        js: PUBLIC_PATH + 'vendor.js',
    },
}

try {
    const assetsFileContents = fs.readFileSync(assetsFile)
    assets = JSON.parse(assetsFileContents.toString())
} catch (e) {
    logError('Error reading assets.json!', e)
}

export const updateAssetLocations = (newAssets: Assets) => {
    assets = newAssets
}

export const getAssetLocations = () => assets

/**
 * Returns a HTML snippet for all CSS assets
 */
export const getCssAssetHtml = () => (
    `<link rel="stylesheet" type="text/css" href="${assets.main.css}${watchMode
        ? '?' + Date.now()
        : ''
    }" />`
)

/**
 * Returns a HTML snippet for all JavaScript assets
 */
export const getJsAssetHtml = () => (
    `<script src="${assets.vendor.js}"></script>
    <script src="${assets.main.js}" async></script>`
)

/**
 * Inserts all assets into a given HTML document string
 */
export const addAssetsToHtml = (html: string) => {
    let modifiedHtml = html
    modifiedHtml = modifiedHtml.replace(
        '</head>',
        getCssAssetHtml() + '</head>',
    )
    modifiedHtml = modifiedHtml.replace(
        '</body>',
        getJsAssetHtml() + '</body>',
    )
    return modifiedHtml
}
