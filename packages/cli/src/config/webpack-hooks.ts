import webpack from 'webpack'
import { Logger } from 'typescript-log'

import { WebpackHooks, CreateWebpackConfig, CreateWebpackConfigOptions } from '.'
import { getCustomConfigFile } from '@project-watchtower/server'

export function getWebpackHooks(log: Logger, root: string) {
    return getCustomConfigFile<WebpackHooks>(
        log,
        root,
        'config/webpack-hooks',
        getCustomConfigFile<WebpackHooks>(log, process.cwd(), 'config/webpack-hooks', {}),
    )
}

export function getHook(
    hook: webpack.Configuration | CreateWebpackConfig | undefined,
    options: CreateWebpackConfigOptions,
): webpack.Configuration {
    if (hook === undefined) {
        return {}
    }
    if (typeof hook === 'function') {
        return hook(options)
    }

    return hook
}
