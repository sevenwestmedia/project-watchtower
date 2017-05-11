import { getWebpackConfig } from '../../lib/build/build'

describe('build/build', () => {

    it('getWebpackConfig', () => {
        expect(getWebpackConfig('server', 'prod')).toBeTruthy()
        expect(getWebpackConfig('client', 'prod')).toBeTruthy()
        expect(getWebpackConfig('server', 'dev')).toBeTruthy()
        expect(getWebpackConfig('client', 'dev')).toBeTruthy()
        expect(getWebpackConfig('server', 'debug')).toBeTruthy()
        expect(getWebpackConfig('client', 'debug')).toBeTruthy()
        expect(getWebpackConfig('server', 'foo' as any)).toBeUndefined()
        expect(getWebpackConfig('foo' as any, 'prod')).toBeUndefined()
    })

})
