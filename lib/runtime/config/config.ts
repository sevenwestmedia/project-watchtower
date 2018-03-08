import * as path from 'path'
import { getCustomConfigFile } from '../util/fs'
import { BuildConfig, BuildConfigOverride } from '../../types'
import { Logger } from '../universal'

const defaultConfig = (root: string): BuildConfig => ({
    ASSETS_PATH_PREFIX: 'static/',
    BASE: root,
    ASSETS_ROOT: path.resolve(root),
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    OUTPUT: path.resolve(root, 'dist'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    CSS_AUTOPREFIXER: ['last 2 versions'],
    HAS_SERVER: true,
    LINT_EXCLUDE: [],
    PUBLIC_PATH: '/',
    DEV_SERVER_PORT: 3000,
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_BUNDLE_ALL: false,
    SERVER_INCLUDE_IN_BUNDLE: ['project-watchtower'],
    SERVER_PUBLIC_DIR: path.resolve(root, 'public'),
    STATIC_RESOURCE_NAMES: false,
    STATS_ENV: {},
    STATS_PAGES: { home: '/' },
})

const customConfig = (log: Logger, root: string) =>
    getCustomConfigFile<BuildConfigOverride>(log, root, 'config/config', {})

export const getConfig = (log: Logger, root: string) => ({
    ...defaultConfig(root),
    ...customConfig(log, root),
})
