import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import * as autoprefixer from 'autoprefixer'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import * as AssetsPlugin from 'assets-webpack-plugin'
import * as HtmlPlugin from 'html-webpack-plugin'
import * as dotenv from 'dotenv'
import CONFIG from './config'
import { updateAssetLocations } from '../server/assets'
import { Assets } from '../types'

const {
    CLIENT_ENTRY,
    CLIENT_OUTPUT,
    CLIENT_POLYFILLS,
    PUBLIC_PATH,
    MODULE_PATHS,
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

// TODO the typings for dotenv are out of date
const env: any = dotenv.config()

const envReplace: { [key: string]: string } = {}

if (env && env.parsed) {
    Object.keys(env.parsed).forEach((key) => {
        if (key === 'NODE_ENV') {
            return
        }
        envReplace['process.env.' + key] = JSON.stringify(env.parsed[key])
    })

    plugins.push(new webpack.DefinePlugin(envReplace))
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
                                plugins: () => [
                                    autoprefixer({ browsers: ['last 2 versions'] }),
                                ],
                            },
                        },
                        'resolve-url-loader',
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
