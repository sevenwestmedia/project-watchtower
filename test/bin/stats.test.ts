import * as fs from 'fs'
import * as path from 'path'
import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import stats from '../../lib/bin/stats'
import { getTestPort } from '../test-helpers'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 90000

describe('stats', () => {

    it('will build stats', async () => {
        const port = await getTestPort()
        process.env.PORT = port.toString()

        await clean()
        await build()
        await stats('verbose')

        const filePath = path.resolve(process.cwd(), 'build-stats.csv')
        expect(fs.existsSync(filePath)).toBe(true)
    })

})
