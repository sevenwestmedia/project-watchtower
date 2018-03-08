import * as fs from 'fs'
import * as path from 'path'
import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import stats from '../../lib/bin/stats'
import { getConfig } from '../../lib/runtime/config/config'
import { getTestPort } from '../test-helpers'
import { createConsoleLogger } from '../../lib/runtime/universal'

// Increase test timeout because builds might take a while
;(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 90000

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())

describe('stats', () => {
    it('will build stats', async () => {
        const port = await getTestPort()
        process.env.PORT = port.toString()

        await clean(log, buildConfig)
        await build(log, buildConfig)
        await stats(log, buildConfig, 'verbose')

        const filePath = path.resolve(process.cwd(), 'build-stats.csv')
        expect(fs.existsSync(filePath)).toBe(true)
    })
})
