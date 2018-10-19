import fs from 'fs'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import AssetsPlugin from 'assets-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import autoprefixer from 'autoprefixer'
import { updateAssetLocations } from '../runtime/server/assets'
import { BuildConfig } from '../../lib'
import { getAssetsFile } from '../runtime/server'
import { CreateWebpackConfig } from './index'

type EntryPoints = {
    [name: string]: string[]
}

const getPlugins = (buildConfig: BuildConfig) => [
    new AssetsPlugin({
        filename: path.relative(process.cwd(), getAssetsFile(buildConfig.OUTPUT)),
        processOutput: assets => {
            updateAssetLocations(assets)
            return JSON.stringify(assets)
        },
    }),
]
/**
 * Base webpack config for the client that is used both in development and production
 * - Compile SCSS to CSS and extract into external assets
 * - Create assets.json that maps the created assets to their locations
 * - Create vendor chunk with everything from node_modules except for SWM modules
 */
const clientBaseConfig: CreateWebpackConfig = options => {
    const {
        CLIENT_ENTRY,
        OUTPUT,
        CLIENT_POLYFILLS,
        CSS_AUTOPREFIXER,
        PUBLIC_PATH,
        SERVER_PUBLIC_DIR,
    } = options.buildConfig

    const entry: EntryPoints = {
        main: [CLIENT_ENTRY],
    }

    if (CLIENT_POLYFILLS && fs.existsSync(CLIENT_POLYFILLS)) {
        entry.commons = [CLIENT_POLYFILLS]
    }
    const plugins = getPlugins(options.buildConfig)

    if (SERVER_PUBLIC_DIR) {
        const indexHtml = path.resolve(SERVER_PUBLIC_DIR, 'index.html')

        if (fs.existsSync(indexHtml)) {
            plugins.push(
                new HtmlPlugin({
                    inject: true,
                    template: indexHtml,
                }),
            )
        }
    }

    return {
        entry,
        output: {
            path: OUTPUT,
            publicPath: PUBLIC_PATH,
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    commons: {
                        name: 'commons',
                        chunks: 'initial',
                        minChunks: 2,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendor',
                        chunks: 'all',
                    },
                },
            },
        },
        module: {
            rules: [
                {
                    test: /\.s?css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: () => [autoprefixer({ browsers: CSS_AUTOPREFIXER })],
                            },
                        },
                        {
                            loader: 'resolve-url-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                    ],
                },
            ],
        },
        plugins,
    }
}

export default clientBaseConfig
