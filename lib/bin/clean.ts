import doClean from '../clean'
import { BuildConfig } from '../../lib'

const clean = (buildConfig: BuildConfig, ...paths: string[]) => {
    const { CLIENT_OUTPUT, SERVER_OUTPUT } = buildConfig
    return doClean([
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
