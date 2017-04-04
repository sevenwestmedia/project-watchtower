import merge from '../../lib/build/merge'

describe('build/merge', () => {

    it('merge', () => {
        const merged = merge(
            {
                entry: 'foo',
            },
            {
                output: {
                    filename: 'bundle.js',
                },
            },
        )
        expect(merged).toEqual({
            entry: 'foo',
            output: {
                filename: 'bundle.js',
            },
        })
    })

})
