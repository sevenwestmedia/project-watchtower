import buildStats from '../stats'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const stats = (log: Logger, buildConfig: BuildConfig, ...params: string[]) => {
    const verbose = params.indexOf('verbose') !== -1

    return buildStats(log, buildConfig, verbose)
}

export default stats
