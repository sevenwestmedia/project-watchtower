import CONFIG from '../build/config/config'
import build from './build'
import start from './start'
import watchServer from '../watch/server'
import { StartParam } from '../types'

const { HAS_SERVER } = CONFIG

const startParams: StartParam[] = [
    'fast',
]

const filterStartParams = (args: string[]) => (
    args.filter((x) => (startParams as string[]).indexOf(x) !== -1) as StartParam[]
)

const watch = (...args: string[]) => {

    const isServerWatch = HAS_SERVER
        && args.indexOf('server') !== -1

    if (isServerWatch) {
        return watchServer()
    } else {
        const buildPromise: Promise<any> = HAS_SERVER
            ? build('server', 'dev')
            : Promise.resolve()

        return buildPromise.then(() => (
            start('watch', ...filterStartParams(args))
        ))
    }
}

export default watch
