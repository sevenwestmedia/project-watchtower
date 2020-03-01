import { BuildConfigOverride } from 'packages/server/src'
import path from 'path'
import { consoleLogger, noopLogger } from 'typescript-log'
import {
    formatFileSize,
    getCustomConfigFile,
    getFileSize,
    readFile,
    writeFile,
} from '../../../packages/server/src/utils/fs'
import { expectPromiseToFail } from '../../test-helpers'

const packageJson = path.resolve(process.cwd(), 'package.json')
const buildStatsFile = path.resolve(process.cwd(), 'build-stats.csv')

const log = consoleLogger()

describe('util/fs', () => {
    it('readFile', async () => {
        const content = await readFile(log, packageJson)
        expect(content).toContain('project-watchtower')
    })

    it('readFile - non-existent file', async () => {
        expectPromiseToFail(readFile(noopLogger(), packageJson + 'x'))
    })

    it('getFileSize', async () => {
        const size = await getFileSize(log, packageJson)
        expect(size).toBeGreaterThan(100)
    })

    it('writeFile', async () => {
        await writeFile(log, buildStatsFile, 'foobar')
        const content = await readFile(log, buildStatsFile)
        expect(content).toBe('foobar')
    })

    it('formatFileSize', () => {
        expect(formatFileSize(2048)).toBe('2.0000')
    })

    it('formatFileSize 0.02', () => {
        expect(formatFileSize(20)).toBe('0.0195')
    })

    it('getCustomConfigFile', () => {
        const buildConfig = getCustomConfigFile<BuildConfigOverride>(
            log,
            path.resolve(__dirname, '../../test-project'),
            'config/config',
            {},
        )
        expect(buildConfig).toEqual({
            CLIENT_ENTRY: './test/test-project/src/client/index.tsx',
            LINT_EXCLUDE: [],
            SERVER_ENTRY: './test/test-project/src/server/start.ts',
            TS_CONFIG_CLIENT: 'test/test-project/tsconfig.json',
            TS_CONFIG_SERVER: 'test/test-project/tsconfig.json',
        })

        const nonExistentConfig = getCustomConfigFile<BuildConfigOverride>(
            log,
            path.join(__dirname, '../../test/test-project'),
            'config/foobar',
            {},
        )
        expect(nonExistentConfig).toEqual({})
    })
})
