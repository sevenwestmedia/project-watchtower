#!/usr/bin/env node

import build from './build'
import start from './start'
import clean from './clean'
import lint from './lint'
import { BuildParam, StartParam } from '../types'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

switch (command) {

    case 'build':
        build(...commandArgs as BuildParam[])
        break

    case 'start':
        start(...commandArgs as StartParam[])
        break

    case 'clean':
        clean(...commandArgs)
        break

    case 'lint':
        lint(...commandArgs)
        break

    default:
        // tslint:disable-next-line no-console
        console.log(`
## Project Watchtower

Scripts:

    build [<target>] [<environment>]
    start [watch] [fast] [prod]
    clean [<glob> ...]
    lint [<glob> ...]

Refer to docs/api.md for the full API documentation
`)

}
