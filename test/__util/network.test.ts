import * as express from 'express'
import { waitForConnection } from '../../lib/__util/network'

describe('__util/network', () => {

    it('waitForConnection', () => {
        const port = 3000
        const app = express()
        const server = app.listen(port)

        return waitForConnection(port)
            .then(() => server.close())
    })

})
