import { getWebpackConfig } from '../../lib/build/build'
import { getConfig } from '../../lib/runtime/config/config'

const buildConfig = getConfig(process.cwd())

describe('build/build', () => {
    it('getWebpackConfig', () => {
        expect(getWebpackConfig(buildConfig, 'server', 'prod')).toBeTruthy()
        expect(getWebpackConfig(buildConfig, 'client', 'prod')).toBeTruthy()
        expect(getWebpackConfig(buildConfig, 'server', 'dev')).toBeTruthy()
        expect(getWebpackConfig(buildConfig, 'client', 'dev')).toBeTruthy()
        expect(getWebpackConfig(buildConfig, 'server', 'debug')).toBeTruthy()
        expect(getWebpackConfig(buildConfig, 'client', 'debug')).toBeTruthy()
        expect(getWebpackConfig(buildConfig, 'server', 'foo' as any)).toBeUndefined()
        expect(getWebpackConfig(buildConfig, 'foo' as any, 'prod')).toBeUndefined()
    })
})
