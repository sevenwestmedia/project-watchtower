import * as express from 'express'
import getAssetLocations from 'project-watchtower/lib/build/assets'

const app = express()
app.use(express.static('public'))

const assets = getAssetLocations()

app.get('*', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" type="text/css" href="${assets.main.css}" />
</head>
<body>
    <div id="app-root"></div>
    <script src="${assets.vendor.js}"></script>
    <script src="${assets.main.js}"></script>
</body>
</html>`)
})

app.listen(3000)
