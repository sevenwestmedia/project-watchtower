import fs from 'fs'
import { ExternalItemFunctionData } from 'webpack'
import path from 'path'
import { CreateWebpackConfigOptions } from '.'


type WebpackExternalFunctionElement = ((
    data: ExternalItemFunctionData,
    callback: (
        err?: null | Error,
        result?: string | boolean | string[] | { [index: string]: any }
    ) => void
) => void)

export function createServerExternals(
    options: CreateWebpackConfigOptions,
): WebpackExternalFunctionElement {
    const baseDirNodeModules = path.resolve(options.buildConfig.BASE, 'node_modules')
    const nodeModules: string[] = []
    if (fs.existsSync(baseDirNodeModules)) {
        nodeModules.push(...fs.readdirSync(baseDirNodeModules))
    }
    const cwdNodeModules = path.resolve(process.cwd(), 'node_modules')
    if (fs.existsSync(cwdNodeModules)) {
        nodeModules.push(...fs.readdirSync(cwdNodeModules))
    }
    return (data, callback) => {
        const request = data.request

        if (request === '@project-watchtower/cli') {
            resolveFromNodeModules()
        } else if (
            options.buildConfig.SERVER_BUNDLE_ALL &&
            !options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT
        ) {
            includeInBundle()
        } else if (options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT) {
            if (request && options.buildConfig.SERVER_BUNDLE_ALL_EXCEPT.includes(request)) {
                resolveFromNodeModules()
            } else {
                includeInBundle()
            }
        } else if (request && options.buildConfig.SERVER_INCLUDE_IN_BUNDLE.includes(request)) {
            includeInBundle()
        } else if (request && nodeModules.includes(request)) {
            resolveFromNodeModules()
        } else {
            includeInBundle()
        }

        function includeInBundle() {
            callback()
        }

        function resolveFromNodeModules() {
            callback(null, 'commonjs ' + request)
        }
    }
}
