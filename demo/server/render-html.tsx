import { HelmetData } from 'react-helmet'
import * as serialize from 'serialize-javascript'
import { Assets, RenderMarkup } from '../../lib/runtime/server/ssr'

export interface RenderHtmlProps {
    head: HelmetData | undefined
    renderMarkup: RenderMarkup
    reduxState: object
    assets: Assets
}

// Spread won't work properly without the any
const serializeOptions: serialize.SerializeJSOptions =
    process.env.NODE_ENV === 'production' ? {} : { space: 4 }

export const renderHtml = ({ head, renderMarkup, reduxState, assets }: RenderHtmlProps) => {
    return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link id="css-main" type="text/css" rel="stylesheet" href="${assets.main.css}">
        ${head && head.title ? head.title.toString() : ''}
        ${head && head.base ? head.base.toString() : ''}
        ${head && head.script ? head.script.toString() : ''}
        ${head && head.meta ? head.meta.toString() : ''}
        ${head && head.link ? head.link.toString() : ''}
    </head>
    <body>
        <div id="root">${renderMarkup.html}</div>
        <script>window.INITIAL_STATE = ${serialize(reduxState, serializeOptions)}</script>
        <script src="${assets.vendor.js}"></script>
        <script async src="${assets.main.js}"></script>
    </body>
</html>`
}
