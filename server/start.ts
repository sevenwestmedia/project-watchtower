/**
 * For testing only
 */

import * as express from 'express'

const port = parseInt(process.env.PORT || '3000', 10)

const app = express()

app.get('*', (_req, res) => {
    res.status(200).send(
        `<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
<p>
hello world hello world hello world hello world hello world hello world hello world
hello world hello world hello world hello world hello world hello world hello world
hello world hello world hello world hello world hello world hello world hello world
</p>
</body>
</html>`
    )
})

app.listen(port, () => {
    // tslint:disable-next-line no-console
    console.log(`Server listening on port ${port}`)
})
