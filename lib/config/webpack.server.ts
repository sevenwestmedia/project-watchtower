import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import CONFIG from './config'

const { SERVER_ENTRY, SERVER_OUTPUT, PUBLIC_PATH, BASE } = CONFIG

const nodeModules = fs.readdirSync(path.resolve(BASE, 'node_modules'))

/**
 * Base Webpack config for the server that is used in both development and production
 * - Ignore SCSS files
 * - treat everything in node_modules as an external dependency
 * - add source-map-support to every file
 */
const serverBaseConfig: webpack.Configuration = {
    target: 'node',
    entry: {
        main: [
            SERVER_ENTRY,
        ],
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

        // the component library has to be included to resolve .scss imports
        if (moduleName === 'swm-component-library') {
            (callback as any)()
        } else if (nodeModules.indexOf(moduleName) !== -1) {
            callback(null, 'commonjs ' + request)
        } else {
            (callback as any)()
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

export default serverBaseConfig
