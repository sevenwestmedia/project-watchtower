import path from 'path'
import { Logger } from 'typescript-log'

import {
    BuildConfig,
    BuildConfigOverride,
    RuntimeConfig,
    getCustomConfigFile,
    isWatchtowerServer,
    readFileSync,
    projectDir,
} from '..'

function getDefaultConfig(root: string): BuildConfig {
    return {
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
    }
}

function getCustomConfig(log: Logger, root: string) {
    return getCustomConfigFile<BuildConfigOverride>(log, root, 'config/config', {})
}

export function getBuildConfig(log: Logger, root: string) {
    return {
        ...getDefaultConfig(root),
        ...getCustomConfig(log, root),
    }
}

export const watchtowerConfigFilename = 'watchtower.config'

export function getRuntimeConfigFromBuildConfig(buildConfig: BuildConfig): RuntimeConfig {
    return {
        ASSETS_PATH: path.join(buildConfig.OUTPUT, buildConfig.ASSETS_PATH_PREFIX),
        ASSETS_PATH_PREFIX: buildConfig.ASSETS_PATH_PREFIX,
        BASE: buildConfig.OUTPUT,
        PUBLIC_PATH: buildConfig.PUBLIC_PATH,
        SERVER_PUBLIC_DIR: buildConfig.SERVER_PUBLIC_DIR,
    }
}

export function getRuntimeConfig(log: Logger): RuntimeConfig {
    if (isWatchtowerServer()) {
        log.debug(
            { projectDir },
            'Project dir specified, using build config to build runtime config',
        )

        const config = getBuildConfig(log, projectDir())
        return getRuntimeConfigFromBuildConfig(config)
    }

    return JSON.parse(readFileSync(log, watchtowerConfigFilename))
}
