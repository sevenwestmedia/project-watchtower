import * as fs from 'fs'
import * as path from 'path'
import clean from '../../lib/bin/clean'
import build from '../../lib/bin/build'
import CONFIG from '../../lib/runtime/config/config'
import { getAssetLocations } from '../../lib/runtime/server/assets'

// Increase test timeout because builds might take a while
(jasmine as any).DEFAULT_TIMEOUT_INTERVAL = 30000

const { SERVER_OUTPUT, SERVER_PUBLIC_DIR } = CONFIG

describe('bin/build', () => {

    it('will build', async () => {
        await clean()
        await build()

        const filePath = path.resolve(SERVER_OUTPUT, 'server.js')
        expect(fs.existsSync(filePath)).toBe(true)

        const assetsPath = path.resolve(process.cwd(), 'assets.json')
        expect(fs.existsSync(assetsPath)).toBe(true)

        const assets = getAssetLocations()

        const files = [
            assets.main.js,
            assets.main.css,
            assets.vendor.js,
        ].map((f) => path.resolve(SERVER_PUBLIC_DIR, f.slice(1)))

        files.forEach((f) => {
            expect(fs.existsSync(f)).toBe(true)
        })
    })

})
