import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()
process.env.NODE_ENV = 'test'

const root = process.cwd()
const testSetupFile = path.resolve(root, 'config', 'test-setup')

const debug =
    typeof global.v8debug === 'object' || /--debug|--inspect/.test(process.execArgv.join(' '))
if (debug) {
    // tslint:disable-next-line:no-console
    console.log('DEBUGGER ATTACHED, increasing test timeout')
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 5 * 1000
}

if (fs.existsSync(testSetupFile + '.ts') || fs.existsSync(testSetupFile + '.js')) {
    // tslint:disable-next-line no-var-requires
    require(testSetupFile)
}
