import * as path from 'path'
import { dynamicRequire, existsSync } from '../util/fs'
import { logError } from '../util/log'
import { BuildConfig, BuildConfigOverride } from '../types'

const root = process.cwd()

const defaultConfig: BuildConfig = {
    ASSETS_PATH_PREFIX: 'static/',
    BASE: root,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'public', 'assets'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    CSS_AUTOPREFIXER: ['last 2 versions'],
    HAS_SERVER: true,
    LINT_EXCLUDE: [],
    MODULE_PATHS: [
        root,
        path.resolve(root, 'node_modules'),
        path.resolve(root, 'common'),
    ],
    PUBLIC_PATH: '/assets/',
    PORT: 3000,
    SERVER_BUNDLE_EXTERNALS: [
        'swm-component-library',
        'project-watchtower',
    ],
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_OUTPUT: path.resolve(root, 'build'),
    SERVER_PUBLIC_DIR: path.resolve(root, 'public'),
    STATIC_RESOURCE_NAMES: false,
    STATS_ENV: {},
    STATS_PAGES: { home: '/' },
    WATCH_IGNORE: /node_modules(?!.+swm-component-library)/,
}

const getCustomConfig = (): BuildConfigOverride => {
    const customConfigFile = path.resolve(root, 'config', 'config.js')
    const customConfigFileTS = path.resolve(root, 'config', 'config.ts')

    if (existsSync(customConfigFile)) {
        // using dynamicRequire to support bundling project-watchtower with webpack
        return dynamicRequire(customConfigFile).default
    }

    if (existsSync(customConfigFileTS)) {
        logError('/config/config.ts only found as TypeScript file.')
        logError('Please make sure to compile all TS files in the /config folder to JS!')
        process.exit(1)
    }

    return {}
}

const CONFIG = {
    ...defaultConfig,
    ...getCustomConfig(),
}

export default CONFIG
