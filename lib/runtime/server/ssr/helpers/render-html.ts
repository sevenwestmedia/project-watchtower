import { RenderHtml } from '../create-middleware'

export const renderHtml: RenderHtml<any> = ({ pageTags, renderMarkup }) => {
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
    </body>
</html>`
}
