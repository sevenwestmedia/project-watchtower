#!/usr/bin/env node

import build from './build'
import start from './start'
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

    default:
        // tslint:disable-next-line no-console
        console.log(`
## Project Watchtower

Scripts:

    build [<target>] [<environment>]
    start [watch] [fast] [prod]

Refer to docs/api.md for the full API documentation
`)

}
