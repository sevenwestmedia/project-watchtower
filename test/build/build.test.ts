import { getWebpackConfig } from '../../lib/build/build'
import { getConfig } from '../../lib/runtime/config/config'

const buildConfig = getConfig(process.cwd())

describe('build/build', () => {
    it('getWebpackConfig', () => {
        expect(getWebpackConfig(buildConfig.BASE, 'server', 'prod')).toBeTruthy()
        expect(getWebpackConfig(buildConfig.BASE, 'client', 'prod')).toBeTruthy()
        expect(getWebpackConfig(buildConfig.BASE, 'server', 'dev')).toBeTruthy()
        expect(getWebpackConfig(buildConfig.BASE, 'client', 'dev')).toBeTruthy()
        expect(getWebpackConfig(buildConfig.BASE, 'server', 'debug')).toBeTruthy()
        expect(getWebpackConfig(buildConfig.BASE, 'client', 'debug')).toBeTruthy()
        expect(getWebpackConfig(buildConfig.BASE, 'server', 'foo' as any)).toBeUndefined()
        expect(getWebpackConfig(buildConfig.BASE, 'foo' as any, 'prod')).toBeUndefined()
    })
})
