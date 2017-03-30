import * as fs from 'fs'
import * as path from 'path'
import { logError } from '../../__util/log'
import { BuildConfig, BuildConfigOverride } from '../../types'

const root = process.cwd()

const defaultConfig: BuildConfig = {
    BASE: root,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'public', 'assets'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_OUTPUT: path.resolve(root, 'build'),
    PUBLIC_PATH: '/assets/',
}

const customConfigFile = path.resolve(root, 'config', 'config.js')
let customConfig: BuildConfigOverride = {}

try {
    if (fs.existsSync(customConfigFile)) {
        // tslint:disable-next-line no-var-requires
        customConfig = require(customConfigFile).default
    }
} catch (e) {
    logError('Error reading config/config.js!', e)
}

const CONFIG = {
    ...defaultConfig,
    ...customConfig,
}

export default CONFIG
