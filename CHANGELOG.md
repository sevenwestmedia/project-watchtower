# Changelog

## vNext

* Add `debug` environment for `pwt build server debug`
* Add `pwt start debug` and `START_DEBUG_MODE` environment flag
* Add `WATCH_IGNORE` configuration
* Add lighthouse build stats for first meaningful paint and time to interactive
* Add `CSS_AUTOPREFIXER` configuration

## v0.1.3 (2017-05-01)

* Add `pwt test debug` for debugging Jest tests

## v0.1.2 (2017-04-26)

* Use `webpack-dotenv-plugin` to allow environment variables to be defined in the actual runtime environment during build

## v0.1.1 (2017-04-24)

* Replace `process.env` variables in client build with the values defined in the `.env` file
* Add `raw-loader` for `.md` files
* Add `html-webpack-plugin` to client build if `<SERVER_PUBLIC_DIR>/index.html` exists
