import buildStats from '../stats'
import { BuildConfig } from '../../lib'

const stats = (buildConfig: BuildConfig, ...params: string[]) => {
    const verbose = params.indexOf('verbose') !== -1

    return buildStats(buildConfig, verbose)
}

export default stats
