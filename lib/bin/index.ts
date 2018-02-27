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
import { getConfig } from '../runtime/config/config'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

const exitOnError = (result: Promise<any>) => {
    result.catch(e => {
        logError(e || 'Error occurred, exiting...')
        process.exit(1)
    })
}

const exitAfter = (result: Promise<any>) =>
    exitOnError(
        result.then(() => {
            // force process to exit
            process.exit(0)
        }),
    )

const projectSwitchIndex = commandArgs.indexOf('-p')
let workingDirectory = process.cwd()
if (projectSwitchIndex !== -1) {
    const projectSwitchArgs = commandArgs.splice(projectSwitchIndex, 2)
    if (projectSwitchArgs.length === 2) {
        workingDirectory = projectSwitchArgs[1]
    }
}

const buildConfig = getConfig(workingDirectory)

switch (command) {
    case 'build':
        exitAfter(build(buildConfig, ...(commandArgs as BuildParam[])))
        break

    case 'coverage':
        exitAfter(test(buildConfig, '--coverage', ...commandArgs))
        break

    case 'clean':
        exitAfter(clean(buildConfig, ...commandArgs))
        break

    case 'explore-bundle':
        exitOnError(exploreBundle(buildConfig, ...commandArgs))
        break

    case 'lint':
        exitAfter(lint(buildConfig, ...commandArgs))
        break

    case 'start':
        exitOnError(start(buildConfig, ...(commandArgs as StartParam[])))
        break

    case 'stats':
        exitAfter(stats(buildConfig, ...commandArgs))
        break

    case 'test':
        exitAfter(test(buildConfig, ...commandArgs))
        break

    case 'watch':
        exitOnError(watch(buildConfig, ...(commandArgs as WatchParam[])))
        break

    default:
        log(`
## Project Watchtower

Scripts:

    build [complete] [<target>] [<environment>] [-p <project dir>]
    clean [-p <project dir>] [<glob> ...]
    coverage [<jest options> ...] [-p <project dir>]
    explore-bundle [disableHoisting] [-p <project dir>]
    lint [tslint] [sass-lint] [-p <project dir>] [<glob> ...]
    start [watch] [fast] [prod] [debug] [inspect] [client] [-p <project dir>]
    stats [verbose] [-p <project dir>]
    test [debug] [-p <project dir>] [<jest options> ...]
    watch [server] [client] [fast] [inspect] [-p <project dir>]

Refer to docs/cli.md for the full API documentation
`)
}
