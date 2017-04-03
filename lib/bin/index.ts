import build from './build'
import clean from './clean'
import exploreBundle from './explore-bundle'
import lint from './lint'
import start from './start'
import stats from './stats'
import test from './test'
import watch from './watch'

import { log, logError } from '../__util/log'
import { BuildParam, StartParam } from '../types'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

const exitOnError = (result: Promise<any>) => {
    result.catch((e) => {
        logError(e)
        process.exit(1)
    })
}

switch (command) {

    case 'build':
        exitOnError(build(...commandArgs as BuildParam[]))
        break

    case 'coverage':
        exitOnError(test('--coverage', ...commandArgs))
        break

    case 'clean':
        exitOnError(clean(...commandArgs))
        break

    case 'explore-bundle':
        exitOnError(exploreBundle())
        break

    case 'lint':
        exitOnError(lint(...commandArgs))
        break

    case 'start':
        exitOnError(start(...commandArgs as StartParam[]))
        break

    case 'stats':
        exitOnError(stats())
        break

    case 'test':
        exitOnError(test(...commandArgs))
        break

    case 'watch':
        exitOnError(watch(...commandArgs))
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
