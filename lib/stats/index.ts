import * as path from 'path'
import bundleSize from './bundle-size'
import ssrStats from './ssr-stats'
import lighthouseStats from './lighthouse'
import { writeFile } from '../util/fs'
import { log } from '../util/log'

const root = process.cwd()

export interface BuildMetrics {
    [key: string]: string
}

export const measureBuildStats = async (): Promise<BuildMetrics> => {

    const bundleMetrics = await bundleSize()
    const ssrMetrics = await ssrStats()
    const lighthouseMetrics = await lighthouseStats()

    return {
        ...bundleMetrics,
        ...ssrMetrics,
        ...lighthouseMetrics,
    }
}

export const writeBuildStats = async (metrics: BuildMetrics) => {

    // TeamCity expects key-value pairs written to the console

    Object.keys(metrics).forEach((key) => {
        log(`##teamcity[buildStatisticValue key='${key}' value='${metrics[key]}']`)
    })

    // Jenkins wants a CSV file

    const keys: string[] = []
    const values: string[] = []

    Object.keys(metrics).forEach((key) => {
        keys.push(key)
        values.push(metrics[key])
    })

    const titleRow = keys.join(',')
    const valueRow = values.join(',')

    const fileContent = titleRow
        + '\n'
        + valueRow

    const statsFilePath = path.resolve(root, 'build-stats.csv')

    await writeFile(statsFilePath, fileContent)
}

const measureAndWriteBuildStats = async () => {
    const metrics = await measureBuildStats()
    await writeBuildStats(metrics)
}

export default measureAndWriteBuildStats
