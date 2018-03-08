import doClean from '../clean'
import { BuildConfig } from '../../lib'
import { Logger } from '../runtime/universal'

const clean = (log: Logger, buildConfig: BuildConfig, ...paths: string[]) => {
    const { CLIENT_OUTPUT, SERVER_OUTPUT } = buildConfig
    return doClean(log, [
        CLIENT_OUTPUT,
        SERVER_OUTPUT,
        '{client,common,server}/**/*.{js,map}',
        'assets.json',
        'build-stats.csv',
        'coverage',
        ...paths,
    ])
}

export default clean
