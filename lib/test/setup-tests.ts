import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()
process.env.NODE_ENV = 'test'

const root = process.cwd()
const testSetupFile = path.resolve(root, 'config', 'test-setup')

if (fs.existsSync(testSetupFile + '.ts') || fs.existsSync(testSetupFile + '.js')) {
    // tslint:disable-next-line no-var-requires
    require(testSetupFile)
}
