import webpack from 'webpack'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { BuildConfig } from '../../lib'
import { CreateWebpackConfigOptions } from './index'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import os from 'os'

const disableTypeCheck = process.env.START_FAST_MODE === 'true'
const disableCaching = process.env.CACHING_DISABLED || false

export const fileLoaderConfig = (buildConfig: BuildConfig) => ({
    test: /\.(ico|jpg|png|gif|otf|webp|svg|ttf)(\?.*)?$/,
    exclude: /\/favicon.ico$/,
    loader: 'file-loader',
    options: {
        name: buildConfig.ASSETS_PATH_PREFIX + 'media/[name].[hash:8].[ext]',
    },
})

const plugins = [new webpack.NoEmitOnErrorsPlugin()]

if (!disableTypeCheck) {
    plugins.push(new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true })) // fork ts checking
}

const osCpus = os.cpus().length
const threadLoaderCpus = !disableTypeCheck ? osCpus - 1 : osCpus

const threadLoader = {
    loader: 'thread-loader',
    options: {
        // there should be 1 cpu for the fork-ts-checker-webpack-plugin if its enabled
        workers: threadLoaderCpus,
    },
}

const tsLoader = {
    loader: 'ts-loader',
    options: {
        transpileOnly: true,
        happyPackMode: true, // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
    },
}

const cacheLoader = (cacheDirectory: string) => {
    return {
        loader: 'cache-loader',
        options: {
            cacheDirectory,
        },
    }
}

/**
 * Base webpack configuration that is shared by the server and the client
 * - load original source maps from custom SWM dependencies
 * - compile TypeScript to JavaScript
 * - handle static files (images and fonts)
 */
function baseConfig(options: CreateWebpackConfigOptions) {
    return {
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '*'],
            symlinks: false,
            plugins: [new TsconfigPathsPlugin()],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: !disableCaching
                        ? [threadLoader, cacheLoader(options.cacheDirectory), tsLoader]
                        : [threadLoader, tsLoader],
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
        plugins,
    }
}

export default baseConfig
