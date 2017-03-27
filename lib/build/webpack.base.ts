import * as path from 'path'
import * as webpack from 'webpack'
import { CheckerPlugin } from 'awesome-typescript-loader'
import PATHS from './paths'

const { BASE } = PATHS
const DISABLE_TYPECHECK = process.env.DISABLE_TYPECHECK === 'true'

const baseConfig: webpack.Configuration = {
    devtool: 'source-map',
    resolve: {
        extensions: [
            '.ts', '.tsx', '.js', '.scss', '*',
        ],
        modules: [
            BASE,
            path.resolve(BASE, 'node_modules'),
            path.resolve(BASE, 'common'),
        ],
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
                exclude: [
                    path.resolve(BASE, 'node_modules'),
                ],
                options: {
                    transpileOnly: DISABLE_TYPECHECK,
                    useTranspileModule: DISABLE_TYPECHECK,
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
        ],
    },
    plugins: [
        new CheckerPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
    ],
}

export default baseConfig
