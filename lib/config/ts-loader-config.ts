import webpack from 'webpack'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { CreateWebpackConfigOptions } from '../runtime/server'
import { BuildTarget } from '../types'

const disableCaching = String(process.env.BUILD_CACHE_DISABLED).toLowerCase() === 'true'

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
    const tsLoaderOptions: any = {}

    if (configFile) {
        tsConfigPathsPluginConfig.configFile = configFile
        tsLoaderOptions.configFile = configFile
    }
    resolvePlugins.push(new TsconfigPathsPlugin(tsConfigPathsPluginConfig))

    const tsLoader = {
        loader: 'ts-loader',
        options: tsLoaderOptions,
    }

    return {
        test: /\.tsx?$/,
        use: !disableCaching ? [cacheLoader(options.cacheDirectory), tsLoader] : [tsLoader],
    }
}
