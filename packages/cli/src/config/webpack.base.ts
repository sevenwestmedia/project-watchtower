import webpack from 'webpack'
import { BuildConfig } from '@project-watchtower/server'
import { CreateWebpackConfigOptions } from '.'

export const fileLoaderConfig = (buildConfig: BuildConfig) => ({
    exclude: /\/favicon.ico$/,
    loader: 'file-loader',
    options: {
        name: buildConfig.ASSETS_PATH_PREFIX + 'media/[name].[hash:8].[ext]',
        esModule: false,
    },
    test: /\.(ico|jpg|png|gif|otf|webp|svg|ttf)(\?.*)?$/,
})

const plugins = [new webpack.NoEmitOnErrorsPlugin()]

/**
 * Base webpack configuration that is shared by the server and the client
 * - load original source maps from custom SWM dependencies
 * - compile TypeScript to JavaScript
 * - handle static files (images and fonts)
 */
export function baseConfig(options: CreateWebpackConfigOptions): webpack.Configuration {
    return {
        module: {
            rules: [
                fileLoaderConfig(options.buildConfig),
                {
                    loader: 'file-loader',
                    options: {
                        name: options.buildConfig.ASSETS_PATH_PREFIX + 'fonts/[name].[ext]',
                        esModule: false,
                    },
                    test: /\.(eot|woff|woff2)(\?.*)?$/,
                },
            ],
        },
        plugins,
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '*'],
            plugins: [],
            symlinks: false,
            modules: [
                'node_modules',
                '@project-watchtower/cli',
                '@project-watchtower/runtime',
                '@project-watchtower/server',
            ],
            fallback: {
                util: require.resolve('util/'),
                url: require.resolve('url/')
            }
        },
    }
}
