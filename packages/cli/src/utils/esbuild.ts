import esbuild from 'esbuild'
import { Logger } from 'typescript-log'
import { esbuildPluginAliasPath } from 'esbuild-plugin-alias-path'
const inlineImportPlugin = require('esbuild-plugin-inline-import')

const tsConfig = esbuild.transformSync('', {
    loader: 'tsx',
    tsconfigRaw: `{
        "extends":"../../tsconfig.settings.json",
        "compilerOptions": {
            "baseUrl": ".",
            "noEmit": false,
            "declaration": true,
            "removeComments": true,
            "noImplicitAny": true,
            "moduleResolution": "node",
            "target": "es5",
            "strict": true,
            "noImplicitReturns": true,
            "jsx": "react",
            "importHelpers": true,
            "noEmitHelpers": true,
            "skipLibCheck": true,
            "esModuleInterop": true,
            "incremental": true,
            "composite": true,
            "outDir":"./tsc-out",
            "rootDir":"./src",
            "jsx":"react"
        },
        "include":[
          "src/**/*.ts",
          "src/**/*.tsx"
        ],
        "references":[
          {
            "path":"../../libs/component-library"
          },
          {
            "path":"../../libs/web-common"
          },
          {
            "path":"../../libs/publication-types"
          },
          {
            "path":"../../libs/web-server-common"
          },
          {
            "path":"../../libs/common"
          }
        ]
      }`,
})

export const esbuildPromise = (log: Logger, options?: esbuild.BuildOptions) =>
    new Promise<void>(() => {
        options && log.info(options)

        log.info(tsConfig.code)
        esbuild
            .build({
                ...options,
                bundle: true,
                treeShaking: true,
                minify: true,
                entryPoints: ['./src/server/start.ts'],
                outfile: '/Users/cale/projects/news-mono/apps/thewest/dist/server.js',
                target: 'node14',
                tsconfig: tsConfig.code,
                platform: 'node',
                loader: {
                    '.jpg': 'file',
                    '.png': 'file',
                    '.svg': 'file',
                    '.woff2': 'file',
                    '.woff': 'file',
                    '.eot': 'file',
                    '.ttf': 'file',
                    '.otf': 'file',
                },
                plugins: [
                    inlineImportPlugin(),
                    esbuildPluginAliasPath({
                        alias: { '@news-mono/component-libary': '../../libs/component-library' },
                    }),
                    esbuildPluginAliasPath({
                        alias: { '@news-mono/web-common': '../../libs/web-common' },
                    }),
                    esbuildPluginAliasPath({
                        alias: { '@news-mono/publication-types': '../../libs/publication-types' },
                    }),
                    esbuildPluginAliasPath({
                        alias: { '@news-mono/web-server-common': '../../libs/web-server-common' },
                    }),
                    esbuildPluginAliasPath({
                        alias: { '@news-mono/common': '../../libs/common' },
                    }),
                ],
                external: [
                    'esbuild',
                    'terser-webpack-plugin',
                    'fsevents',
                    'webpack',
                    'node-libs-browser',
                    'html-webpack-plugin',
                ],
            })
            .catch((error) => {
                log.error(error)
                process.exit(1)
            })
    })
