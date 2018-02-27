import * as path from 'path'
import { getCustomConfigFile } from '../util/fs'
import { BuildConfig, BuildConfigOverride } from '../../types'

const defaultConfig = (root: string): BuildConfig => ({
    ASSETS_PATH_PREFIX: 'static/',
    BASE: root,
    ASSETS_ROOT: path.resolve(root),
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'dist'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    CSS_AUTOPREFIXER: ['last 2 versions'],
    HAS_SERVER: true,
    LINT_EXCLUDE: [],
    PUBLIC_PATH: '/',
    PORT: 3000,
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_BUNDLE_ALL: false,
    SERVER_INCLUDE_IN_BUNDLE: ['project-watchtower'],
    SERVER_OUTPUT: path.resolve(root, 'dist'),
    SERVER_PUBLIC_DIR: path.resolve(root, 'public'),
    STATIC_RESOURCE_NAMES: false,
    STATS_ENV: {},
    STATS_PAGES: { home: '/' },
})

const customConfig = (root: string) =>
    getCustomConfigFile<BuildConfigOverride>(root, 'config/config', {})

export const getConfig = (root: string) => ({
    ...defaultConfig(root),
    ...customConfig,
})
