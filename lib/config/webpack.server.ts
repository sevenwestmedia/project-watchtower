import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import { BuildConfig } from '../../lib'

/**
 * Base Webpack config for the server that is used in both development and production
 * - Ignore SCSS files
 * - treat everything in node_modules as an external dependency
 * - add source-map-support to every file
 */
const serverBaseConfig = (options: { buildConfig: BuildConfig }): webpack.Configuration => {
    const { BASE, PUBLIC_PATH, SERVER_ENTRY, OUTPUT } = options.buildConfig

    const baseDirNodeModules = path.resolve(BASE, 'node_modules')
    const nodeModules: string[] = []
    if (fs.existsSync(baseDirNodeModules)) {
        nodeModules.push(...fs.readdirSync(baseDirNodeModules))
    }
    const cwdNodeModules = path.resolve(process.cwd(), 'node_modules')
    if (fs.existsSync(cwdNodeModules)) {
        nodeModules.push(...fs.readdirSync(cwdNodeModules))
    }

    return {
        target: 'node',
        entry: {
            main: [SERVER_ENTRY],
        },
        output: {
            path: OUTPUT,
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

            if (options.buildConfig.SERVER_BUNDLE_ALL) {
                callback(undefined, undefined)
            } else if (options.buildConfig.SERVER_INCLUDE_IN_BUNDLE.indexOf(moduleName) !== -1) {
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
