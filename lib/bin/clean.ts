import doClean from '../clean'
import CONFIG from '../build/config/config'

const { CLIENT_OUTPUT, SERVER_OUTPUT } = CONFIG

const clean = (...paths: string[]) => (
    doClean([
        CLIENT_OUTPUT,
        SERVER_OUTPUT,
        '{client,common,config,server}/**/*.{js,map}',
        ...paths,
    ]).catch((e) => {
        throw e
    })
)

export default clean
