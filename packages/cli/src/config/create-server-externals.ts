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
        if (request === '@project-watchtower/cli') {
            resolveFromNodeModules()
        } else if (
            options.buildConfig.SERVER_BUNDLE_ALL &&
            !options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT
        ) {
            includeInBundle()
        } else if (options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT) {
            if (options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT.includes(request)) {
                resolveFromNodeModules()
            } else {
                includeInBundle()
            }
        } else if (options.buildConfig.SERVER_INCLUDE_IN_BUNDLE.includes(request)) {
            includeInBundle()
        } else if (nodeModules.includes(request)) {
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
