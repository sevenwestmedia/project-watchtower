import build from './build'
import clean from './clean'
import exploreBundle from './explore-bundle'
import lint from './lint'
import start from './start'
import stats from './stats'
import test from './test'
import watch from './watch'

import { log, logError } from '../runtime/util/log'
import { BuildParam, StartParam, WatchParam } from '../types'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

const exitOnError = (result: Promise<any>) => {
    result
        .catch((e) => {
            logError(e || 'Error occurred, exiting...')
            process.exit(1)
        })
}

const exitAfter = (result: Promise<any>) => (
    exitOnError(result
        .then(() => {
            // force process to exit
            process.exit(0)
        }))
)

switch (command) {

    case 'build':
        exitAfter(build(...commandArgs as BuildParam[]))
        break

    case 'coverage':
        exitAfter(test('--coverage', ...commandArgs))
        break

    case 'clean':
        exitAfter(clean(...commandArgs))
        break

    case 'explore-bundle':
        exitOnError(exploreBundle())
        break

    case 'lint':
        exitAfter(lint(...commandArgs))
        break

    case 'start':
        exitOnError(start(...commandArgs as StartParam[]))
        break

    case 'stats':
        exitAfter(stats())
        break

    case 'test':
        exitAfter(test(...commandArgs))
        break

    case 'watch':
        exitOnError(watch(...commandArgs as WatchParam[]))
        break

    default:
        log(`
## Project Watchtower

Scripts:

    build [complete] [<target>] [<environment>]
    clean [<glob> ...]
    coverage [<jest options> ...]
    explore-bundle
    lint [<glob> ...]
    start [watch] [fast] [prod]
    stats
    test [<jest options> ...]
    watch [server]

Refer to docs/api.md for the full API documentation
`)

}
