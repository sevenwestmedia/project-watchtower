import clean from '../../../lib/bin/clean'
import {
    updateAssetLocations,
    getAssetLocations,
    getCssAssetHtml,
    getJsAssetHtml,
    addAssetsToHtml,
} from '../../../lib/runtime/server/assets'

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
        await clean()
        expect(getAssetLocations()).toEqual({
            main: {
                js: '/assets/static/js/main.js',
                css: '/assets/static/css/main.css',
            },
            vendor: {
                js: '/assets/static/js/vendor.js',
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

    })

    it('getJsAssetHtml', () => {
        const html = getJsAssetHtml()
        expect(html).toContain('<script')
        expect(html).toContain(assets.main.js)
        expect(html).toContain(assets.vendor.js)
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
        expect(html).toContain('<script')
        expect(html).toContain('<link')
        expect(html).toContain(assets.main.css)
        expect(html).toContain(assets.main.js)
        expect(html).toContain(assets.vendor.js)
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

        const count = (str: string, substr: string) => (
            (str.match(new RegExp(substr, 'g')) || []).length
        )

        expect(count(html, '<link')).toBe(1)
        expect(count(html, '<script')).toBe(2)
    })

})
