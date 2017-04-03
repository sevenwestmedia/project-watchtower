import doClean from '../clean'
import CONFIG from '../config/config'

const { CLIENT_OUTPUT, SERVER_OUTPUT } = CONFIG

const clean = (...paths: string[]) => (
    doClean([
        CLIENT_OUTPUT,
        SERVER_OUTPUT,
        '{client,common,server}/**/*.{js,map}',
        'assets.json',
        'build-stats.csv',
        'coverage',
        ...paths,
    ])
)

export default clean
