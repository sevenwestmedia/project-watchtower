describe('Jest module mappers', () => {

    it('mocks SASS imports', () => {
        const mod = require('./foo.scss')
        expect(mod).toBe('')
    })

    it('mocks bundle-loader imports', () => {
        const loader = require('bundle-loader?lazy!./foobar')
        expect(loader).toBeTruthy()

        loader((mod: any) => {
            expect(mod).toBeTruthy()
            expect(mod.default).toBeTruthy()
        })
    })

})
