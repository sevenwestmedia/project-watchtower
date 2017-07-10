import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import * as autoprefixer from 'autoprefixer'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import * as AssetsPlugin from 'assets-webpack-plugin'
import * as HtmlPlugin from 'html-webpack-plugin'
import * as DotenvPlugin from 'webpack-dotenv-plugin'
import CONFIG from '../runtime/config/config'
import { updateAssetLocations } from '../runtime/server/assets'
import { Assets } from '../types'

const {
    BASE,
    CLIENT_ENTRY,
    CLIENT_OUTPUT,
    CLIENT_POLYFILLS,
    CSS_AUTOPREFIXER,
    MODULE_PATHS,
    PUBLIC_PATH,
    SERVER_PUBLIC_DIR,
} = CONFIG

type EntryPoints = {
    [name: string]: string[],
}

const entry: EntryPoints = {
    main: [
        CLIENT_ENTRY,
    ],
}

if (CLIENT_POLYFILLS && fs.existsSync(CLIENT_POLYFILLS)) {
    entry.vendor = [
        CLIENT_POLYFILLS,
    ]
}

const plugins: webpack.Plugin[] = [
    new AssetsPlugin({
        filename: 'assets.json',
        processOutput: (assets: Assets) => {
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

            const isSwmModule =
                module.context.indexOf('swm-component-library', modulePos) !== -1
                || module.context.indexOf('redux-data-loader', modulePos) !== -1
                || module.context.indexOf('project-watchtower', modulePos) !== -1

            return !isSwmModule
        },
    }),
]

const env = path.resolve(BASE, '.env')
const envDefault = path.resolve(BASE, '.env.default')

if (fs.existsSync(env) && fs.existsSync(envDefault)) {
    plugins.push(new DotenvPlugin({
        path: '.env',
        sample: '.env.default',
    }))
}

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

/**
 * Base webpack config for the client that is used both in development and production
 * - Compile SCSS to CSS and extract into external assets
 * - Create assets.json that maps the created assets to their locations
 * - Create vendor chunk with everything from node_modules except for SWM modules
 */
const clientBaseConfig: webpack.Configuration = {
    entry,
    output: {
        path: CLIENT_OUTPUT,
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
                                plugins: () => [
                                    autoprefixer({ browsers: CSS_AUTOPREFIXER }),
                                ],
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
                                includePaths: MODULE_PATHS,
                            },
                        },
                    ],
                }),
            },
        ],
    },
    plugins,
}

export default clientBaseConfig
