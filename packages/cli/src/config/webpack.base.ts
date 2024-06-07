import webpack from 'webpack'
import { CreateWebpackConfigOptions } from '.'

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
                {
                    test: /\.(ico|jpg|png|gif|otf|webp|svg|ttf)(\?.*)?$/,
                    type: 'asset/resource',
                    generator: {
                        filename: options.buildConfig.ASSETS_PATH_PREFIX + 'media/[name].[hash:8].[ext]'
                    }
                },
                {
                    test: /\.(eot|woff|woff2)(\?.*)?$/,
                    type: 'asset/resource',
                    generator: {
                        filename: options.buildConfig.ASSETS_PATH_PREFIX + 'fonts/[name].[ext]',
                    },
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
