import fs from 'fs'
import path from 'path'
import webpack from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { CreateWebpackConfigOptions, BuildConfig } from '../runtime/server'
import { BuildTarget } from '../types'

const disableCaching = String(process.env.BUILD_CACHE_DISABLED).toLowerCase() === 'true'
const disableTypeCheck = process.env.DISABLE_TYPE_CHECKING === 'true'

const cacheLoader = (cacheDirectory: string) => {
    return {
        loader: 'cache-loader',
        options: {
            cacheDirectory,
        },
    }
}

export function getTypeScriptWebpackRule(
    _plugins: webpack.Plugin[],
    resolvePlugins: webpack.ResolvePlugin[],
    options: CreateWebpackConfigOptions,
    buildTarget: BuildTarget,
): webpack.RuleSetRule {
    const configFile =
        (buildTarget === 'server'
            ? options.buildConfig.TS_CONFIG_SERVER
            : options.buildConfig.TS_CONFIG_CLIENT) || 'tsconfig.json'

    options.log.info(`Target ${buildTarget} using ts config file: ${configFile}`)

    const tsConfigPathsPluginConfig: any = {}
    const tsLoaderOptions: any = {
        compilerOptions: {
            noEmit: false,
        },
        transpileOnly: disableTypeCheck,
        experimentalWatchApi: true,
        projectReferences: true,
    }

    if (configFile) {
        tsConfigPathsPluginConfig.configFile = configFile
        tsLoaderOptions.configFile = configFile
    }
    resolvePlugins.push(new TsconfigPathsPlugin(tsConfigPathsPluginConfig))

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

    return {
        test: /\.tsx?$/,
        use: !disableCaching
            ? [cacheLoader(options.cacheDirectory), babelLoader, tsLoader]
            : [babelLoader, tsLoader],
    }
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
