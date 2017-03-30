#!/usr/bin/env node

import build from './build'
import clean from './clean'
import exploreBundle from './explore-bundle'
import lint from './lint'
import start from './start'
import test from './test'

import { log } from '../__util/log'
import { BuildParam, StartParam } from '../types'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

switch (command) {

    case 'build':
        build(...commandArgs as BuildParam[])
        break

    case 'clean':
        clean(...commandArgs)
        break

    case 'explore-bundle':
        exploreBundle()
        break

    case 'lint':
        lint(...commandArgs)
        break

    case 'start':
        start(...commandArgs as StartParam[])
        break

    case 'test':
        test(...commandArgs)
        break

    default:
        log(`
## Project Watchtower

Scripts:

    build [<target>] [<environment>]
    clean [<glob> ...]
    explore-bundle
    lint [<glob> ...]
    start [watch] [fast] [prod]
    test [<jest options> ...]

Refer to docs/api.md for the full API documentation
`)

}
