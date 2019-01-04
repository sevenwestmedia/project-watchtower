# SSR with SCSS support

To add sass support you need to extend the webpack config. To do that we can use the webpack hooks feature in watchtower.

## Setup

1. Add `config/webpack-hooks.js`
2. Configure sass the way you want
3. Watchtower will merge any hooks config in with the default config
