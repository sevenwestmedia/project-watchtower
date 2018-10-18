import * as webpack from 'webpack'
import { version as tsVersion } from 'typescript'
import { CheckerPlugin, TsConfigPathsPlugin } from 'awesome-typescript-loader'
import { BuildConfig } from '../../lib'
import { CreateWebpackConfig } from './index'

const disableTypeCheck = process.env.START_FAST_MODE === 'true'

export const fileLoaderConfig = (buildConfig: BuildConfig) => ({
    test: /\.(ico|jpg|png|gif|otf|webp|svg|ttf)(\?.*)?$/,
    exclude: /\/favicon.ico$/,
    loader: 'file-loader',
    options: {
        name: buildConfig.ASSETS_PATH_PREFIX + 'media/[name].[hash:8].[ext]',
    },
})

/**
 * Base webpack configuration that is shared by the server and the client
 * - load original source maps from custom SWM dependencies
 * - compile TypeScript to JavaScript
 * - handle static files (images and fonts)
 */
const baseConfig: CreateWebpackConfig = options => ({
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '*'],
        // force linked dependencies to use the project's node_modules
        // https://github.com/webpack/webpack/issues/985#issuecomment-261497772
        symlinks: false,
        plugins: [new TsConfigPathsPlugin()],
    } as any, // @typings/webpack is missing resolve.symlinks
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                options: {
                    transpileOnly: disableTypeCheck,
                    useTranspileModule: disableTypeCheck,
                    // Force >ES2015 module syntax (including dynamic imports)
                    // to enable scope hoisting
                    module: tsVersion > '2.4' ? 'esnext' : 'es2015',
                },
            },
            fileLoaderConfig(options.buildConfig),
            {
                test: /\.(eot|woff|woff2)(\?.*)?$/,
                loader: 'file-loader',
                options: {
                    name: options.buildConfig.ASSETS_PATH_PREFIX + 'fonts/[name].[ext]',
                },
            },
            {
                test: /\.md$/,
                loader: 'raw-loader',
            },
        ],
    },
    plugins: [new CheckerPlugin(), new webpack.NoEmitOnErrorsPlugin()],
})

export default baseConfig
