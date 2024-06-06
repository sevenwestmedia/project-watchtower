/* eslint-disable no-undef */

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    // Configuration options for css-minimizer-webpack-plugin
    module: {
        rules: [
            {
                test: '/.s?css$/',
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    optimization: {
        minizer: [
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [new MiniCssExtractPlugin()],

    default: {
        CLIENT_ENTRY: './examples/ssr-with-sass/src/client/index.tsx',
        SERVER_ENTRY: './examples/ssr-with-sass/src/server/start.ts',
        TS_CONFIG_CLIENT: 'examples/ssr-with-sass/tsconfig.json',
        TS_CONFIG_SERVER: 'examples/ssr-with-sass/tsconfig.json',
    },
}
