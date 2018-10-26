import serialize from 'serialize-javascript'

// This is for 2 reasons
// 1) It is hard to read the snapshots when the urls are encoded like this
// 2) The jest-serializer-path library sees this as a windows Drive, replacing it with a /
// so we get http/dev-whatever ..., instead of https:\\u002F\\u002Fdev
function unencodeUrls(serialisedJs: string) {
    return serialisedJs.replace(/\\u002F\\u002F/g, '//')
}

const serializeOptions: serialize.SerializeJSOptions =
    process.env.NODE_ENV === 'production' ? {} : { space: 4 }

/**
 * Returns a script tag to be interpolated directly into the <head> of the rendered html
 * @param key Should be a globally unique JS variable name
 * @param value The data to be transferred
 * @param prettyPrint Formats the state in the html, making it readable. Defaults to false in production, true otherwise
 */
export function transferState(key: string, value: any, prettyPrint?: boolean) {
    return `<script>window.${key} = ${unencodeUrls(
        serialize(
            value,
            prettyPrint === undefined ? serializeOptions : prettyPrint ? { space: 4 } : {},
        ),
    )}</script>`
}
