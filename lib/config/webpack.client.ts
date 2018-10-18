import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
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
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: (module: { context: string }) => {
            if (!module.context) {
                return false
            }

            const modulePos = module.context.indexOf('node_modules')
            if (modulePos === -1) {
                return false
            }

            const isWatchtower = module.context.indexOf('project-watchtower', modulePos) !== -1

            return !isWatchtower
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
        entry.vendor = [CLIENT_POLYFILLS]
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
        module: {
            rules: [
                {
                    test: /\.s?css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
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
                    }),
                },
            ],
        },
        plugins,
    }
}

export default clientBaseConfig
