import * as fs from 'fs'
import * as webpack from 'webpack'
import * as merge from 'webpack-merge'
import * as autoprefixer from 'autoprefixer'
import * as ExtractTextPlugin from 'extract-text-webpack-plugin'
import * as AssetsPlugin from 'assets-webpack-plugin'
import baseConfig from './webpack.base'
import PATHS from './paths'

const { CLIENT_ENTRY, CLIENT_OUTPUT, CLIENT_POLYFILLS, PUBLIC_PATH } = PATHS

type EntryPoints = {
    [name: string]: string[]
}

const entry: EntryPoints = {
    main: [
        CLIENT_ENTRY,
    ],
}

if (fs.existsSync(CLIENT_POLYFILLS)) {
    entry.vendor = [
        CLIENT_POLYFILLS,
    ]
}

const clientBaseConfig = merge(baseConfig, {
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
                            },
                        },
                    ],
                }),
            },
        ],
    },
    plugins: [
        new AssetsPlugin({ filename: 'assets.json' }),
        new ExtractTextPlugin('css/[name].[contenthash:8].css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: (module: { context: string }) => (
                module.context
                && module.context.indexOf('node_modules') !== -1
                && module.context.indexOf('swm-component-library') === -1
            ),
        }),
    ]
})

export default clientBaseConfig
