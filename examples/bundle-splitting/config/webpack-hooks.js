/* eslint-disable no-undef */
/* eslint-disable no-var */
const path = require('path')
const LoadablePlugin = require('@loadable/webpack-plugin')

exports.default = {
    client: options => {
        return {
            plugins: [
                new LoadablePlugin({
                    writeToDisk: true,
                    filename: 'loadable-stats.json',
                }),
            ],
        }
    },
}
