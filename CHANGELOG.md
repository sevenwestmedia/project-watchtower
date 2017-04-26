# Changelog

## v0.1.2 (2017-04-26)

* Use `webpack-dotenv-plugin` to allow environment variables to be defined in the actual runtime environment during build

## v0.1.1 (2017-04-24)

* Replace `process.env` variables in client build with the values defined in the `.env` file
* Add `raw-loader` for `.md` files
* Add `html-webpack-plugin` to client build if `<SERVER_PUBLIC_DIR>/index.html` exists
