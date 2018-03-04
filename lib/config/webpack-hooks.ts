import { getCustomConfigFile } from '../runtime/util/fs'
import { WebpackHooks } from '../types'
import { Logger } from '../runtime/universal'

export const webpackHooks = (log: Logger, root: string) =>
    getCustomConfigFile<WebpackHooks>(log, root, 'config/webpack-hooks', {})

export default webpackHooks
