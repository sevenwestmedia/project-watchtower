import * as fs from 'fs'
import * as path from 'path'
import clean from '../../lib/bin/clean'
import { getConfig } from '../../lib/runtime/config/config'

describe('bin/clean', () => {
    it('will clean', async () => {
        const buildConfig = getConfig(process.cwd())
        const filePath = path.resolve(buildConfig.CLIENT_OUTPUT, 'foo.js')

        try {
            fs.mkdirSync(buildConfig.CLIENT_OUTPUT)
        } catch (e) {
            // do nothing
        }
        fs.writeFileSync(filePath, 'hello')

        await clean(buildConfig)

        expect(fs.existsSync(filePath)).toBe(false)
    })
})
