import * as fs from 'fs'
import * as path from 'path'
import CONFIG from '../../lib/runtime/config/config'
import clean from '../../lib/clean'

const { CLIENT_OUTPUT } = CONFIG

const doClean = async (paths: string | string[]) => {
    const filePath = path.resolve(CLIENT_OUTPUT, 'foo.js')

    try {
        fs.mkdirSync(CLIENT_OUTPUT)
    } catch (e) {
        // do nothing
    }
    fs.writeFileSync(filePath, 'hello')

    await clean(paths)

    expect(fs.existsSync(filePath)).toBe(false)
}

describe('lib/clean', () => {

    it('will clean', async () => {
        await doClean(CLIENT_OUTPUT)
        await doClean([CLIENT_OUTPUT])
    })

})
