import * as path from 'path'
import bundleSize from './bundle-size'
import ssrStats from './ssr-stats'
import lighthouseStats from './lighthouse'
import { writeFile } from '../runtime/util/fs'
import { log } from '../util/log'
import { BuildConfig } from '../../lib'

export interface BuildMetrics {
    [key: string]: string
}

export const measureBuildStats = async (
    buildConfig: BuildConfig,
    verbose?: boolean,
): Promise<BuildMetrics> => {
    const bundleMetrics = await bundleSize(buildConfig)
    const ssrMetrics = await ssrStats(buildConfig, verbose)
    const lighthouseMetrics = await lighthouseStats(buildConfig, verbose)

    return {
        ...bundleMetrics,
        ...ssrMetrics,
        ...lighthouseMetrics,
    }
}

export const writeBuildStats = async (buildConfig: BuildConfig, metrics: BuildMetrics) => {
    // TeamCity expects key-value pairs written to the console

    Object.keys(metrics).forEach(key => {
        log(`##teamcity[buildStatisticValue key='${key}' value='${metrics[key]}']`)
    })

    // Jenkins wants a CSV file

    const keys: string[] = []
    const values: string[] = []

    Object.keys(metrics).forEach(key => {
        keys.push(key)
        values.push(metrics[key])
    })

    const titleRow = keys.join(',')
    const valueRow = values.join(',')

    const fileContent = titleRow + '\n' + valueRow

    const statsFilePath = path.resolve(buildConfig.BASE, 'build-stats.csv')

    await writeFile(statsFilePath, fileContent)
}

const measureAndWriteBuildStats = async (buildConfig: BuildConfig, verbose = false) => {
    const metrics = await measureBuildStats(buildConfig, verbose)
    await writeBuildStats(buildConfig, metrics)
}

export default measureAndWriteBuildStats
