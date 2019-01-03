import build from './build'
import clean from './clean'
import exploreBundle from './explore-bundle'
import start from './start'
import stats from './stats'
import watch from './watch'

import { getConfig } from '../runtime/config/config'
import { BuildParam, StartParam, WatchParam } from '../types'
import { cliLogger } from '../util/log'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

const exitOnError = (result: Promise<any>) => {
    result.catch(e => {
        cliLogger.error({ err: e }, 'Error occurred, exiting...')
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

const buildConfig = getConfig(cliLogger, workingDirectory)

switch (command) {
    case 'build':
        exitAfter(build(cliLogger, buildConfig, ...(commandArgs as BuildParam[])))
        break

    case 'clean':
        exitAfter(clean(cliLogger, buildConfig, ...commandArgs))
        break

    case 'explore-bundle':
        exitOnError(exploreBundle(cliLogger, buildConfig, ...commandArgs))
        break

    case 'start':
        exitOnError(start(cliLogger, buildConfig, {}, ...(commandArgs as StartParam[])))
        break

    case 'stats':
        exitAfter(stats(cliLogger, buildConfig, ...commandArgs))
        break

    case 'watch':
        exitOnError(watch(cliLogger, buildConfig, {}, ...(commandArgs as WatchParam[])))
        break

    default:
        cliLogger.info(`
## Project Watchtower

Scripts:

    build [<target>] [<environment>] [-p <project dir>]
    clean [-p <project dir>] [<glob> ...]
    explore-bundle [disableHoisting] [-p <project dir>]
    start [watch] [fast] [prod] [debug] [inspect] [client] [-p <project dir>]
    stats [verbose] [-p <project dir>]
    watch [server] [client] [fast] [inspect] [-p <project dir>]

Refer to docs/cli.md for the full API documentation
`)
}
