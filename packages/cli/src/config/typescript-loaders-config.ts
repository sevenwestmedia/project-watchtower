import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { CreateWebpackConfigOptions } from '.'
import { BuildTarget, BuildEnvironment } from '..'
import { BuildConfig } from '@project-watchtower/server'

export function getTypeScriptLoaderWebpackConfig(
    options: CreateWebpackConfigOptions,
    buildTarget: BuildTarget,
    _environment: BuildEnvironment,
): webpack.Configuration {
    const configFile = getTsConfigFile(buildTarget, options.buildConfig)

    options.log.info(`Target ${buildTarget} using ts config file: ${configFile}`)

    const tsConfigPathsPluginConfig: any = {}

    if (configFile) {
        tsConfigPathsPluginConfig.configFile = configFile
    }

    const babelConfig: string | undefined = getBabelConfigFile(buildTarget, options.buildConfig)

    if (babelConfig) {
        options.log.info(`Using babel config: ${babelConfig}`)
    }

    const babelLoader = {
        loader: 'babel-loader',
        options: {
            extends: babelConfig,
        },
    }

    const esbuildLoader = {
        loader: 'esbuild-loader',
        options: {
            loader: 'tsx',
            target: 'es2015',
            tsconfigRaw: require(configFile),
        },
    }

    return {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [babelLoader, esbuildLoader],
                },
            ],
        },
        resolve: {
            plugins: [new TsconfigPathsPlugin(tsConfigPathsPluginConfig)],
        },
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

    const found = locations.find((location) => fs.existsSync(location))

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
