import { Assets } from 'assets-webpack-plugin'
import fs from 'fs'
import path from 'path'
import { BuildConfig, RuntimeConfig } from '../../../lib'
import { PageTag } from './ssr/full-render'

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

export const setDefaultAssets = (buildConfig: BuildConfig) => {
    // When running in dev mode, we don't use assets.json so we need to prime
    // the assets location
    updateAssetLocations({
        main: {
            css: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'css/main.css',
            js: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'js/main.chunk.js',
        },
        vendor: {
            js: buildConfig.PUBLIC_PATH + buildConfig.ASSETS_PATH_PREFIX + 'js/vendor.chunk.js',
        },
    })
}

export function updateAssetLocations(newAssets: Assets) {
    assets = newAssets
    assetsLoaded = true
}

export function getAssetLocations(runtimeConfig: RuntimeConfig) {
    ensureAssets(runtimeConfig)
    return assets
}

export function getAssets(runtimeConfig: RuntimeConfig) {
    ensureAssets(runtimeConfig)
    return assets
}
export const getAbsoluteAssetPath = (runtimeConfig: RuntimeConfig, asset: string) => {
    const staticPath = runtimeConfig.PUBLIC_PATH + runtimeConfig.ASSETS_PATH_PREFIX
    let relativeAsset = asset.slice(staticPath.length)
    if (relativeAsset[0] === '/') {
        relativeAsset = relativeAsset.slice(1)
    }

    return path.resolve(runtimeConfig.ASSETS_PATH, relativeAsset)
}

export function getHeadAssets(buildAssets: Assets): PageTag[] {
    return Object.keys(buildAssets)
        .filter(chunkName => {
            const chunk = buildAssets[chunkName]
            return chunk.css
        })
        .map(chunkName => ({
            tag: `<link id="css-main" type="text/css" rel="stylesheet" href="${
                buildAssets[chunkName].css
            }">`,
        }))
}

export function getBodyAssets(buildAssets: Assets): PageTag[] {
    const chunkNames = Object.keys(buildAssets)
        // Filter assets which are not .js and not main/vendor
        .filter(chunkName => {
            if (chunkName === 'main' || chunkName === 'vendor' || chunkName === 'manifest') {
                return false
            }
            const chunk = buildAssets[chunkName]
            return !!chunk.js
        })

    return ['manifest', 'vendor', ...chunkNames, 'main']
        .filter(chunkName => buildAssets[chunkName])
        .reduce<PageTag[]>((acc, chunkName) => {
            // Turns out, webpack types are wrong, can be an array
            const jsAsset = buildAssets[chunkName].js as string | string[]

            if (Array.isArray(jsAsset)) {
                acc.push(
                    ...jsAsset.map(file => ({
                        tag: `<script src="${file}"></script>`,
                    })),
                )
            } else {
                acc.push({
                    tag: `<script src="${buildAssets[chunkName].js}"></script>`,
                })
            }

            return acc
        }, [])
}
