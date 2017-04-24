import * as path from 'path'
import * as webpack from 'webpack'
import { CheckerPlugin } from 'awesome-typescript-loader'
import CONFIG from './config'

const { BASE, MODULE_PATHS } = CONFIG
const disableTypeCheck = process.env.START_FAST_MODE === 'true'

/**
 * Base webpack configuration that is shared by the server and the client
 * - load original source maps from custom SWM dependencies
 * - compile TypeScript to JavaScript
 * - handle static files (images and fonts)
 */
const baseConfig: webpack.Configuration = {
    devtool: 'source-map',
    resolve: {
        extensions: [
            '.ts', '.tsx', '.js', '.scss', '*',
        ],
        modules: MODULE_PATHS,
        // force linked dependencies to use the project's node_modules
        // https://github.com/webpack/webpack/issues/985#issuecomment-261497772
        symlinks: false,
    } as any, // @typings/webpack is missing resolve.symlinks
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader',
                include: [
                    path.resolve(BASE, 'node_modules', 'swm-component-library'),
                    path.resolve(BASE, 'node_modules', 'redux-data-loader'),
                ],
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/,
                options: {
                    transpileOnly: disableTypeCheck,
                    useTranspileModule: disableTypeCheck,
                },
            },
            {
                test: /\.(ico|jpg|png|gif|otf|webp|svg|ttf)(\?.*)?$/,
                exclude: /\/favicon.ico$/,
                loader: 'file-loader',
                options: {
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
            {
                test: /\.(eot|woff|woff2)(\?.*)?$/,
                loader: 'file-loader',
                options: {
                    name: 'static/fonts/[name].[ext]',
                },
            },
            {
                test: /\.md$/,
                loader: 'raw-loader',
            },
        ],
    },
    plugins: [
        new CheckerPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
}

export default baseConfig
