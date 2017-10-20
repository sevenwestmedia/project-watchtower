import * as path from 'path'
import { getCustomConfigFile } from '../util/fs'
import { BuildConfig, BuildConfigOverride } from '../../types'

const root = process.cwd()

const defaultConfig: BuildConfig = {
    ASSETS_PATH_PREFIX: 'static/',
    BASE: root,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'build', 'client'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    CSS_AUTOPREFIXER: ['last 2 versions'],
    HAS_SERVER: true,
    LINT_EXCLUDE: [],
    MODULE_PATHS: [
        root,
        path.resolve(root, 'node_modules'),
        path.resolve(root, 'common'),
        path.resolve(root, 'app')
    ],
    PUBLIC_PATH: '/',
    PORT: 3000,
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_INCLUDE_IN_BUNDLE: ['swm-component-library', 'project-watchtower'],
    SERVER_OUTPUT: path.resolve(root, 'build', 'server'),
    SERVER_PUBLIC_DIR: path.resolve(root, 'public'),
    STATIC_RESOURCE_NAMES: false,
    STATS_ENV: {},
    STATS_PAGES: { home: '/' },
    WATCH_IGNORE: /node_modules(?!.+swm-component-library)/
}

const customConfig = getCustomConfigFile<BuildConfigOverride>('config/config', {})

const CONFIG = {
    ...defaultConfig,
    ...customConfig
}

export default CONFIG
