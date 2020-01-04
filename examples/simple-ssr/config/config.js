// eslint-disable-next-line no-undef
module.exports = {
    default: {
        CLIENT_ENTRY: './examples/simple-ssr/src/client/index.tsx',
        SERVER_ENTRY: './examples/simple-ssr/src/server/start.ts',
        TS_CONFIG_SERVER: 'examples/simple-ssr/tsconfig.server.json',
        TS_CONFIG_CLIENT: 'examples/simple-ssr/tsconfig.json',
        ADDITIONAL_CIENT_ENTRIES: {
            additional: 'examples/simple-ssr/client/extra.tsx',
        },
    },
}
