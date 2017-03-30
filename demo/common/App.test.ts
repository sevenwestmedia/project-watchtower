import App from './app'

describe('demo suite', () => {

    it('demo test', () => {
        expect(App).toBeTruthy()
    })

    it('environment variables have to be loaded', () => {
        expect(process.env.PORT).toBeDefined()
    })

})
