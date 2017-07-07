import { getCustomConfigFile } from '../runtime/util/fs'
import { WebpackHooks } from '../types'

export const webpackHooks = getCustomConfigFile<WebpackHooks>('config/webpack-hooks', {})

export default webpackHooks
