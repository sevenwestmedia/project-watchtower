import { consoleLogger } from 'typescript-log'
import { createServer } from '../runtime/server/server'

const log = consoleLogger('info')
log.info('Starting Project Watchtower internal server...')

createServer({ log })
