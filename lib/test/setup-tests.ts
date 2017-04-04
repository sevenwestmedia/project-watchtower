import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import { log } from '../util/log'

dotenv.config()
process.env.NODE_ENV = 'test'

const root = process.cwd()
const testSetupFile = path.resolve(root, 'config', 'test-setup')

if (fs.existsSync(testSetupFile + '.ts') || fs.existsSync(testSetupFile + '.js')) {
    log('Using custom test setup file /config/test-setup')
    // tslint:disable-next-line no-var-requires
    require(testSetupFile)
}
