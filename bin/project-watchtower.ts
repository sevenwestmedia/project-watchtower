import build from '../lib/bin/build'

const args = process.argv.slice(2)

const command = args[0]
const commandArgs = args.slice(1)

switch (command) {

    case 'build':
        build(commandArgs)
        break

    default:
        console.error('No or invalid script specified!')

}
