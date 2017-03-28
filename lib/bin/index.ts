import build from './build'
import start from './start'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

switch (command) {

    case 'build':
        build(commandArgs)
        break

    case 'start':
        start(commandArgs)
        break

    default:
        // tslint:disable-next-line no-console
        console.log(`
## Project Watchtower

Scripts:

    build [<target> <environment>]
    start [watch] [fast]
`)

}
