import * as express from 'express'
import { addAssetsToHtml } from 'project-watchtower/lib/build/assets'

const app = express()
app.use(express.static('public'))

app.get('*', (_req, res) => {
    const content = addAssetsToHtml(`<!DOCTYPE html>
<html>
<head>
    <title>Demo</title>
</head>
<body>
    <div id="app-root"></div>
</body>
</html>`)

    res.send(content)
})

app.listen(3000)
