import fs from 'fs'
import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import AssetsPlugin from 'assets-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import AutoDllPlugin from 'autodll-webpack-plugin'
import autoprefixer from 'autoprefixer'
import { updateAssetLocations } from '../runtime/server/assets'
import { BuildConfig } from '../../lib'
import { getAssetsFile } from '../runtime/server'
import { CreateWebpackConfig } from './index'
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin'

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
    new AutoDllPlugin({
        inject: true, // will inject the DLL bundle to index.html
        debug: true,
        filename: '[name]_[hash].js',
        path: './dll',
        entry: {
            vendor: ['react', 'react-dom'],
        },
    }),
    new HardSourceWebpackPlugin(),
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

    let mainEntry = [CLIENT_ENTRY]
    /*
        https://github.com/webpack/webpack/issues/6647
        You should not have a entrypoint for vendor. It's not an entry.
        If you want to run two modules in order at an entrypoint, use an array.
    */
    if (CLIENT_POLYFILLS && fs.existsSync(CLIENT_POLYFILLS)) {
        mainEntry = [CLIENT_POLYFILLS, CLIENT_ENTRY]
    }

    const entry: EntryPoints = {
        main: mainEntry,
    }

    const plugins = getPlugins(options.buildConfig)

    if (SERVER_PUBLIC_DIR) {
        const indexHtml = path.resolve(SERVER_PUBLIC_DIR, 'index.html')

        if (fs.existsSync(indexHtml)) {
            plugins.push(
                new HtmlWebpackPlugin({
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
                    vendor: {
                        test: (module: { context: string }) => {
                            if (!module.context) {
                                return false
                            }

                            const modulePos = module.context.indexOf('node_modules')
                            if (modulePos === -1) {
                                return false
                            }

                            const isWatchtower =
                                module.context.indexOf('project-watchtower', modulePos) !== -1

                            return !isWatchtower
                        },
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
