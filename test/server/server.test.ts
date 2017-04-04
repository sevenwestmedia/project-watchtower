import { createServer } from '../../lib/server/server'

describe('server/server', () => {

    it('createServer', () => (
        new Promise((resolve, reject) => {
            const app = createServer(
                () => {},
                () => {
                    app.get('server').close()
                    resolve()
                },
            )
        })
    ))

})
