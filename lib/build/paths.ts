import * as fs from 'fs'
import * as path from 'path'
import { Paths, PathsOverride } from '../types'

const root = process.cwd()

const defaultPaths: Paths = {
    BASE: root,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'public', 'assets'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_OUTPUT: path.resolve(root, 'build'),
    PUBLIC_PATH: '/assets/',
}

const customPathsFile = path.resolve(root, 'config', 'paths.js')
let customPaths: PathsOverride = {}

try {
    if (fs.existsSync(customPathsFile)) {
        // tslint:disable-next-line no-var-requires
        customPaths = require(customPathsFile).default
    }
} catch (e) {
    console.error('Error reading config/paths.js!', e)
}

const PATHS = {
    ...defaultPaths,
    ...customPaths,
}

export default PATHS
