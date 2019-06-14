import { BuildConfig, CreateWebpackConfigOptions } from 'lib/runtime/server'
import webpack from 'webpack'

export const fileLoaderConfig = (buildConfig: BuildConfig) => ({
    exclude: /\/favicon.ico$/,
    loader: 'file-loader',
    options: {
        name: buildConfig.ASSETS_PATH_PREFIX + 'media/[name].[hash:8].[ext]',
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
function baseConfig(options: CreateWebpackConfigOptions): webpack.Configuration {
    return {
        module: {
            rules: [
                fileLoaderConfig(options.buildConfig),
                {
                    loader: 'file-loader',
                    options: {
                        name: options.buildConfig.ASSETS_PATH_PREFIX + 'fonts/[name].[ext]',
                    },
                    test: /\.(eot|woff|woff2)(\?.*)?$/,
                },
                {
                    loader: 'raw-loader',
                    test: /\.md$/,
                },
            ],
        },
        plugins,
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '*'],
            plugins: [],
            symlinks: false,
        },
    }
}

export default baseConfig
