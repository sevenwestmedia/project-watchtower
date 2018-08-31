import { RenderMarkup } from '../render-app-to-string'
import { PageTags } from '../full-render'

export function renderHtml({
    renderMarkup,
    pageTags,
}: {
    renderMarkup: RenderMarkup
    pageTags: PageTags
}) {
    return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${pageTags.head.map(headAsset => headAsset.tag).join(`
        `)}
    </head>
    <body>
        <div id="root">${renderMarkup.html}</div>
        ${pageTags.body.map(bodyAsset => bodyAsset.tag).join(`
        `)}
    )}
    </body>
</html>`
}
