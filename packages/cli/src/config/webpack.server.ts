import webpack from 'webpack'
import { CreateWebpackConfigOptions } from '.'
import { createServerExternals } from './create-server-externals'

/**
 * Base Webpack config for the server that is used in both development and production
 * - Ignore SCSS files
 * - treat everything in node_modules as an external dependency
 * - add source-map-support to every file
 */
export const serverBaseConfig = (options: CreateWebpackConfigOptions): webpack.Configuration => {
    const { PUBLIC_PATH, SERVER_ENTRY, OUTPUT } = options.buildConfig

    const plugins: webpack.Plugin[] = [
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            entryOnly: false,
            raw: true,
        }),
    ]
    const resolvePlugins: webpack.ResolvePlugin[] = []

    return {
        entry: {
            main: [SERVER_ENTRY],
        },
        externals: createServerExternals(options),
        node: {
            __dirname: true,
            __filename: true,
        },
        output: {
            filename: 'server.js',
            path: OUTPUT,
            publicPath: PUBLIC_PATH,
        },
        plugins,
        resolve: {
            plugins: resolvePlugins,
        },
        target: 'node',
    }
}
