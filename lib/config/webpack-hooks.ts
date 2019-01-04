import { WebpackHooks } from 'lib/runtime/server'
import { Logger } from 'typescript-log'
import webpack from 'webpack'
import { getCustomConfigFile } from '../runtime/util/fs'
import { CreateWebpackConfig, CreateWebpackConfigOptions } from './index'

export const webpackHooks = (log: Logger, root: string) =>
    getCustomConfigFile<WebpackHooks>(log, root, 'config/webpack-hooks', {})

export const getHook = (
    hook: webpack.Configuration | CreateWebpackConfig | undefined,
    options: CreateWebpackConfigOptions,
): webpack.Configuration => {
    if (hook === undefined) {
        return {}
    }
    if (typeof hook === 'function') {
        return hook(options)
    }

    return hook
}

export default webpackHooks
