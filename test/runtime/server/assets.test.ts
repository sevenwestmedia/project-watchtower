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
import { getConfig } from '../../../lib/runtime/config/config'

const buildConfig = getConfig(process.cwd())

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
    it('initial asset location values', async () => {
        await clean(buildConfig)
        expect(getAssetLocations()).toEqual({
            main: {
                js: '/static/js/main.js',
                css: '/static/css/main.css',
            },
            vendor: {
                js: '/static/js/vendor.js',
            },
        })
    })
})

describe('server/assets', () => {
    beforeEach(() => {
        updateAssetLocations(assets)
    })

    it('getAssetLocations', () => {
        expect(getAssetLocations()).toEqual(assets)
    })

    it('getCssAssetHtml', () => {
        const html = getCssAssetHtml()
        const doc = load(html)
        expect(doc('link').length).toBe(1)
        expect(
            doc('link')
                .first()
                .attr('href'),
        ).toContain(assets.main.css)
    })

    it('getJsAssetHtml', () => {
        const html = getJsAssetHtml()
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
        const html = addAssetsToHtml(htmlTemplate)

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
        const html = addAssetsToHtml(htmlTemplate)

        const doc = load(html)
        expect(doc('link').length).toBe(1)
        expect(doc('script').length).toBe(2)
    })

    it('getAbsoluteAssetPath', () => {
        const assetPath = path.resolve(buildConfig.CLIENT_OUTPUT, 'foo/bar')
        expect(getAbsoluteAssetPath(buildConfig, '/foo/bar')).toBe(assetPath)
    })
})
