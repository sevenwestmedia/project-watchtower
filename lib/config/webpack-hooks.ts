import { getCustomConfigFile } from '../runtime/util/fs'
import { WebpackHooks } from '../types'

export const webpackHooks = (root: string) =>
    getCustomConfigFile<WebpackHooks>(root, 'config/webpack-hooks', {})

export default webpackHooks
