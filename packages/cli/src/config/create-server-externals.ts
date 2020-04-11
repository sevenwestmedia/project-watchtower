import fs from 'fs'
import webpack from 'webpack'
import path from 'path'
import { CreateWebpackConfigOptions } from '.'
export function createServerExternals(
    options: CreateWebpackConfigOptions,
): webpack.ExternalsFunctionElement {
    const baseDirNodeModules = path.resolve(options.buildConfig.BASE, 'node_modules')
    const nodeModules: string[] = []
    if (fs.existsSync(baseDirNodeModules)) {
        nodeModules.push(...fs.readdirSync(baseDirNodeModules))
    }
    const cwdNodeModules = path.resolve(process.cwd(), 'node_modules')
    if (fs.existsSync(cwdNodeModules)) {
        nodeModules.push(...fs.readdirSync(cwdNodeModules))
    }
    return (_context, request, callback) => {
        // treat deep imports as externals as well
        const moduleName = request.split('/')[0]

        if (moduleName === '@project-watchtower/cli') {
            resolveFromNodeModules()
        } else if (
            options.buildConfig.SERVER_BUNDLE_ALL &&
            !options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT
        ) {
            includeInBundle()
        } else if (options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT) {
            if (options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT.indexOf(moduleName) !== -1) {
                resolveFromNodeModules()
            } else {
                includeInBundle()
            }
        } else if (options.buildConfig.SERVER_INCLUDE_IN_BUNDLE.indexOf(moduleName) !== -1) {
            includeInBundle()
        } else if (nodeModules.indexOf(moduleName) !== -1) {
            resolveFromNodeModules()
        } else {
            includeInBundle()
        }

        function includeInBundle() {
            callback(undefined, undefined)
        }

        function resolveFromNodeModules() {
            callback(null, 'commonjs ' + request)
        }
    }
}
