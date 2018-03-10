import { load } from 'cheerio'

import * as path from 'path'
import clean from '../../../lib/bin/clean'
import {
    updateAssetLocations,
    getAssetLocations,
    getCssAssetHtml,
    getJsAssetHtml,
    addAssetsToHtml,
    getAbsoluteAssetPath,
} from '../../../lib/runtime/server/assets'
import { getConfig, getRuntimeConfigFromBuildConfig } from '../../../lib/runtime/config/config'
import { createConsoleLogger } from '../../../lib/runtime/universal'

const log = createConsoleLogger()
const buildConfig = getConfig(log, process.cwd())
buildConfig.OUTPUT = path.resolve(buildConfig.BASE, 'test-dist/assets')

const runtimeConfig = getRuntimeConfigFromBuildConfig(buildConfig)

const assets = {
    main: {
        js: 'foo/main.js',
        css: 'foo/css/main.css',
    },
    vendor: {
        js: 'foo/vendor.js',
    },
}

describe('server/assets initial', () => {
    it('throws when no assets have been specified', async () => {
        await clean(log, buildConfig)
        expect(() => getAssetLocations(runtimeConfig)).toThrow()
    })
})

describe('server/assets', () => {
    beforeEach(() => {
        updateAssetLocations(assets)
    })

    it('getAssetLocations', () => {
        expect(getAssetLocations(runtimeConfig)).toEqual(assets)
    })

    it('getCssAssetHtml', () => {
        const html = getCssAssetHtml(runtimeConfig)
        const doc = load(html)
        expect(doc('link').length).toBe(1)
        expect(
            doc('link')
                .first()
                .attr('href'),
        ).toContain(assets.main.css)
    })

    it('getJsAssetHtml', () => {
        const html = getJsAssetHtml(runtimeConfig)
        const doc = load(html)
        expect(doc('script').length).toBe(2)
        expect(
            doc('script')
                .first()
                .attr('src'),
        ).toBe(assets.vendor.js)
        expect(
            doc('script')
                .last()
                .attr('src'),
        ).toBe(assets.main.js)
    })

    it('addAssetsToHtml', () => {
        const htmlTemplate = `<!DOCTYPE html>
<head>
    <title>Foo</title>
</head>
<body>
</body>
</html>`
        const html = addAssetsToHtml(htmlTemplate, runtimeConfig)

        const doc = load(html)
        expect(doc('link').length).toBe(1)
        expect(
            doc('link')
                .first()
                .attr('href'),
        ).toContain(assets.main.css)
        expect(doc('script').length).toBe(2)
        expect(
            doc('script')
                .first()
                .attr('src'),
        ).toBe(assets.vendor.js)
        expect(
            doc('script')
                .last()
                .attr('src'),
        ).toBe(assets.main.js)
    })

    it('addAssetsToHtml - already present', () => {
        const htmlTemplate = `<!DOCTYPE html>
<head>
    <title>Foo</title>
    <link rel="stylesheet" href="${assets.main.css}" />
</head>
<body>

<script src="${assets.vendor.js}"></script>
<script src="${assets.main.js}"></script>
</body>
</html>`
        const html = addAssetsToHtml(htmlTemplate, runtimeConfig)

        const doc = load(html)
        expect(doc('link').length).toBe(1)
        expect(doc('script').length).toBe(2)
    })

    it('getAbsoluteAssetPath', () => {
        const assetPath = path.resolve(buildConfig.OUTPUT, 'static/foo/bar.js')

        expect(getAbsoluteAssetPath(runtimeConfig, '/static/foo/bar.js')).toBe(assetPath)
    })
})
