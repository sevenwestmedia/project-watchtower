import * as path from 'path'
import CONFIG from '../../lib/config/config'

CONFIG.SERVER_PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'demo', 'public')

import { getDefaultHtmlMiddleware } from '../../lib/server/dev'

describe('server/dev', () => {

    it('getDefaultHtmlMiddleware', () => {
        getDefaultHtmlMiddleware()
    })

})
