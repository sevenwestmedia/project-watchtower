import { RenderHtml } from '../create-middleware'
import { PageTag } from '../full-render'

const returnTag = (pageTag: PageTag) => pageTag.tag

export const renderHtml: RenderHtml<any, string> = ({ pageTags, renderResult }) => {
    return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${pageTags.head.map(returnTag).join(``)}
    </head>
    <body>
        ${pageTags.preBody.map(returnTag).join(``)}
        <div id="root">${renderResult}</div>
        ${pageTags.body.map(returnTag).join(``)}
    </body>
</html>`
}
