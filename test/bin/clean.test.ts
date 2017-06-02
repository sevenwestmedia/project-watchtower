import * as fs from 'fs'
import * as path from 'path'
import CONFIG from '../../lib/runtime/config/config'
import clean from '../../lib/bin/clean'

const { CLIENT_OUTPUT } = CONFIG

describe('bin/clean', () => {

    it('will clean', async () => {
        const filePath = path.resolve(CLIENT_OUTPUT, 'foo.js')

        try {
            fs.mkdirSync(CLIENT_OUTPUT)
        } catch (e) {
            // do nothing
        }
        fs.writeFileSync(filePath, 'hello')

        await clean()

        expect(fs.existsSync(filePath)).toBe(false)
    })

})
