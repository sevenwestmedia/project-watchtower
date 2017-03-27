import * as path from 'path'

const root = process.cwd()

const PATHS = {
    BASE: root,
    CLIENT_ENTRY: path.resolve(root, 'client', 'index.tsx'),
    CLIENT_OUTPUT: path.resolve(root, 'public', 'assets'),
    CLIENT_POLYFILLS: path.resolve(root, 'client', 'polyfills.ts'),
    SERVER_ENTRY: path.resolve(root, 'server', 'start.ts'),
    SERVER_OUTPUT: path.resolve(root, 'build'),
    PUBLIC_PATH: '/assets/',
}

export default PATHS
