import * as fs from 'fs'
import * as path from 'path'
import { Assets } from '../types'

const root = process.cwd()
const assetsFile = path.resolve(root, 'assets.json')

let assets: Assets

try {
    const assetsFileContents = fs.readFileSync(assetsFile)
    assets = JSON.parse(assetsFileContents.toString())
} catch (e) {
    console.error('Error reading assets.json!', e)
}

const getAssetLocations = () => assets

export default getAssetLocations
