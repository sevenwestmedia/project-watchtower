import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import ForkTsCheckerNotifierWebpackPlugin from 'fork-ts-checker-notifier-webpack-plugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import { Options } from 'ts-loader'

import { CreateWebpackConfigOptions } from '.'
import { BuildTarget, BuildEnvironment } from '..'
import { BuildConfig } from '@project-watchtower/server'

const disableCaching = String(process.env.BUILD_CACHE_DISABLED).toLowerCase() === 'true'

function cacheLoader(cacheDirectory: string) {
    return {
        loader: 'cache-loader',
        options: {
            cacheDirectory,
        },
    }
}

export function getTsLoaderWebpackConfig(
    options: CreateWebpackConfigOptions,
    buildTarget: BuildTarget,
    environment: BuildEnvironment,
): webpack.Configuration {
    const configFile = getTsConfigFile(buildTarget, options.buildConfig)

    options.log.info(`Target ${buildTarget} using ts config file: ${configFile}`)

    const tsConfigPathsPluginConfig: any = {}
    const tsLoaderOptions: Partial<Options> = {
        compilerOptions: {
            // For tests, but doesn't hurt as noEmit: true doesn't work
            noEmit: false,
        },
        transpileOnly: true,
        experimentalWatchApi: true,
        projectReferences: true,
    }

    if (configFile) {
        tsConfigPathsPluginConfig.configFile = configFile
        tsLoaderOptions.configFile = configFile
    }

    const babelConfig: string | undefined = getBabelConfigFile(buildTarget, options.buildConfig)

    if (babelConfig) {
        options.log.info(`Using babel config: ${babelConfig}`)
    }

    const tsLoader = {
        loader: 'ts-loader',
        options: tsLoaderOptions,
    }
    const babelLoader = {
        loader: 'babel-loader',
        options: {
            extends: babelConfig,
        },
    }

    const forkTsCheckerNotifierOptions = {
        title: `TypeScript (${buildTarget})`,
        excludeWarnings: false,
        alwaysNotify: true,
    }
    const forkTsCheckerNotifierWebpackPlugin = new ForkTsCheckerNotifierWebpackPlugin(
        forkTsCheckerNotifierOptions,
    )
    const forceTsCheckerWebpackPluginOptions = {
        eslint: {
            files: './**/*.{ts,tsx,js,jsx}'
        },
        tsconfig: configFile,
        useTypescriptIncrementalApi: true,
    }
    const forkTsCheckerPlugin = new ForkTsCheckerWebpackPlugin(forceTsCheckerWebpackPluginOptions)

        // Below is for the cache validator, so it sees when these options change
    ;(forkTsCheckerNotifierWebpackPlugin as any).toJSON = () => {
        return `ForkTsCheckerNotifierWebpackPlugin ${JSON.stringify(forkTsCheckerNotifierOptions)}`
    }
    ;(forkTsCheckerPlugin as any).toJSON = () => {
        return `ForkTsCheckerWebpackPlugin ${JSON.stringify(forceTsCheckerWebpackPluginOptions)}`
    }
    return {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: !disableCaching
                        ? [cacheLoader(options.cacheDirectory), babelLoader, tsLoader]
                        : [babelLoader, tsLoader],
                },
            ],
        },
        resolve: {
            plugins: [new TsconfigPathsPlugin(tsConfigPathsPluginConfig)],
        },
        // TODO: Why is the notifier not working when watching?
        plugins:
            environment === 'dev' && process.env.NODE_ENV !== 'test'
                ? [forkTsCheckerPlugin, forkTsCheckerNotifierWebpackPlugin]
                : [],
    }
}

export function getTsConfigFile(buildTarget: string, buildConfig: BuildConfig) {
    const tsconfigFile =
        (buildTarget === 'server' ? buildConfig.TS_CONFIG_SERVER : buildConfig.TS_CONFIG_CLIENT) ||
        'tsconfig.json'

    const locations = [
        path.resolve(buildConfig.BASE, tsconfigFile),
        path.resolve(process.cwd(), tsconfigFile),
    ]

    const found = locations.find(location => fs.existsSync(location))

    if (!found) {
        throw new Error(`Cannot locate ${tsconfigFile}, searched:
${locations.join('\n')}`)
    }

    return found
}

export function getBabelConfigFile(buildTarget: BuildTarget, buildConfig: BuildConfig) {
    const babelConfigFile =
        (buildTarget === 'server'
            ? buildConfig.BABEL_CONFIG_SERVER
            : buildConfig.BABEL_CONFIG_CLIENT) || '.babelrc'

    let babelConfig: string | undefined = path.resolve(buildConfig.BASE, babelConfigFile)

    if (!fs.existsSync(babelConfig)) {
        babelConfig = path.resolve(process.cwd(), babelConfigFile)
        if (!fs.existsSync(babelConfig)) {
            babelConfig = undefined
        }
    }

    return babelConfig
}
