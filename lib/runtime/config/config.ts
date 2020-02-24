import path from 'path'
import { Logger } from 'typescript-log'
import { BuildConfig, BuildConfigOverride, RuntimeConfig } from '../server'
import { getCustomConfigFile, readFileSync } from '../util/fs'

const defaultConfig = (root: string): BuildConfig => ({
    ASSETS_PATH_PREFIX: 'static/',
    BASE: root,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    DEV_SERVER_PORT: 3000,
    HAS_SERVER: true,
    OUTPUT: path.resolve(root, 'dist'),
    PUBLIC_PATH: '/',
    SERVER_BUNDLE_ALL: false,
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_INCLUDE_IN_BUNDLE: ['project-watchtower'],
    SERVER_PUBLIC_DIR: path.resolve(root, 'public'),
    STATIC_RESOURCE_NAMES: false,
    STATS_ENV: {},
    STATS_PAGES: { home: '/' },
})

const customConfig = (log: Logger, root: string) =>
    getCustomConfigFile<BuildConfigOverride>(
        log,
        root,
        'config/config',
        getCustomConfigFile<BuildConfigOverride>(log, process.cwd(), 'config/config', {}),
    )

export const getConfig = (log: Logger, root: string) => ({
    ...defaultConfig(root),
    ...customConfig(log, root),
})

export const watchtowerConfigFilename = 'watchtower.config'

export const getRuntimeConfigFromBuildConfig = (buildConfig: BuildConfig): RuntimeConfig => ({
    ASSETS_PATH: path.join(buildConfig.OUTPUT, buildConfig.ASSETS_PATH_PREFIX),
    ASSETS_PATH_PREFIX: buildConfig.ASSETS_PATH_PREFIX,
    BASE: buildConfig.OUTPUT,
    PUBLIC_PATH: buildConfig.PUBLIC_PATH,
    SERVER_PUBLIC_DIR: buildConfig.SERVER_PUBLIC_DIR,
})

export const getRuntimeConfig = (log: Logger): RuntimeConfig => {
    const projectDir = process.env.PROJECT_DIR
    if (projectDir) {
        log.trace(
            { projectDir },
            'Project dir specified, using build config to build runtime config',
        )

        const config = getConfig(log, projectDir)
        return getRuntimeConfigFromBuildConfig(config)
    }

    return JSON.parse(readFileSync(log, watchtowerConfigFilename))
}
