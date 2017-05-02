import * as fs from 'fs'
import * as path from 'path'
import { logError } from '../util/log'
import { BuildConfig, BuildConfigOverride } from '../types'

const root = process.cwd()

const defaultConfig: BuildConfig = {
    BASE: root,
    HAS_SERVER: true,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'public', 'assets'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_OUTPUT: path.resolve(root, 'build'),
    PUBLIC_PATH: '/assets/',
    SERVER_PUBLIC_DIR: path.resolve(root, 'public'),
    STATIC_RESOURCE_NAMES: false,
    LINT_EXCLUDE: [],
    PORT: 3000,
    MODULE_PATHS: [
        root,
        path.resolve(root, 'node_modules'),
        path.resolve(root, 'common'),
    ],
    WATCH_IGNORE: /node_modules(?!.+swm-component-library)/,
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
