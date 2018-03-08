import { getWebpackConfig } from '../../lib/build/build'
import { getConfig } from '../../lib/runtime/config/config'
import { createConsoleLogger } from '../../lib/runtime/universal'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())

describe('build/build', () => {
    it('getWebpackConfig', () => {
        expect(getWebpackConfig(log, buildConfig, 'server', 'prod')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'client', 'prod')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'server', 'dev')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'client', 'dev')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'server', 'debug')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'client', 'debug')).toBeTruthy()
        expect(getWebpackConfig(log, buildConfig, 'server', 'foo' as any)).toBeUndefined()
        expect(getWebpackConfig(log, buildConfig, 'foo' as any, 'prod')).toBeUndefined()
    })
})
