import * as webpack from 'webpack'
import { getCustomConfigFile } from '../runtime/util/fs'
import { Logger } from '../runtime/universal'
import { WebpackHooks } from '../types'
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
