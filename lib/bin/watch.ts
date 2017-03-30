import CONFIG from '../build/config/config'
import build from './build'
import start from './start'
import watchServer from '../watch/server'

const { HAS_SERVER } = CONFIG

const watch = (...args: string[]) => {

    if (args.indexOf('fast') !== -1) {
        process.env.START_FAST_MODE = 'true'
    }

    const isServerWatch = HAS_SERVER
        && args.indexOf('server') !== -1

    if (isServerWatch) {
        return watchServer()
    } else {
        const buildPromise: Promise<any> = HAS_SERVER
            ? build('server', 'dev')
            : Promise.resolve()

        return buildPromise.then(() => (
            start('watch')
        ))
    }
}

export default watch
