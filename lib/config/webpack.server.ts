import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import { BuildConfig } from '../../lib'

/**
 * Base Webpack config for the server that is used in both development and production
 * - Ignore SCSS files
 * - treat everything in node_modules as an external dependency
 * - add source-map-support to every file
 */
const serverBaseConfig = (buildConfig: BuildConfig): webpack.Configuration => {
    const { BASE, PUBLIC_PATH, SERVER_ENTRY, SERVER_OUTPUT } = buildConfig

    const baseDirNodeModules = path.resolve(BASE, 'node_modules')
    // Try <base>/node_modules, if not present assume they are at
    // <cwd>/node_modules
    const nodeModules = fs.readdirSync(
        fs.existsSync(baseDirNodeModules)
            ? baseDirNodeModules
            : path.resolve(process.cwd(), 'node_modules'),
    )

    return {
        target: 'node',
        entry: {
            main: [SERVER_ENTRY],
        },
        output: {
            path: SERVER_OUTPUT,
            publicPath: PUBLIC_PATH,
            filename: 'server.js',
        },
        module: {
            rules: [
                {
                    test: /\.s?css$/,
                    use: 'null-loader',
                },
            ],
        },
        node: {
            __filename: true,
            __dirname: true,
        },
        externals: (_context, request, callback) => {
            // treat deep imports as externals as well
            const moduleName = request.split('/')[0]

            if (buildConfig.SERVER_BUNDLE_ALL) {
                callback(undefined, undefined)
            } else if (buildConfig.SERVER_INCLUDE_IN_BUNDLE.indexOf(moduleName) !== -1) {
                callback(undefined, undefined)
            } else if (nodeModules.indexOf(moduleName) !== -1) {
                callback(null, 'commonjs ' + request)
            } else {
                callback(undefined, undefined)
            }
        },
        plugins: [
            new webpack.BannerPlugin({
                banner: 'require("source-map-support").install();',
                raw: true,
                entryOnly: false,
            }),
        ],
    }
}

export default serverBaseConfig
