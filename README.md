# Project Watchtower

Project Watchtower is a TypeScript first, opinionated foundation for creating universal (Server Side Rendered) React applications. It's point of difference is that it is highly configurable and allows you to use your own data loading, routing and other approaches.

[![](https://img.shields.io/npm/v/project-watchtower.svg)](https://npmjs.org/package/project-watchtower)

![](./JLsatellite2.jpg)  
[Credit: Wikipedia](https://en.wikipedia.org/wiki/File:JLsatellite2.jpg)

## Why

Project Watchtower was built to allow our team at Seven West Media to build multiple websites built using React and WebPack with server side rendering easily. Over time the drift of our configuration became hard to keep in sync, the JavaScript community moves fast and we want to keep up.

We have also put a lot of effort into solving problems like server side rendering in a reusable way and wanted all of our products to benefit easily from improvements we make over time. We also use TypeScript, and many of the great community options are Babel/Flow first.

### What about create-react-app etc.

Create-react-app is great, it is what gave us the idea for Project Watchtower, but it is a generic tool to serve the entire community and as such it cannot go as far as watchtower does. Watchtower bakes many of our library choices into it (while we try to keep that list as minimal as possible to keep flexibility) to give us a good tradeoff between flexibility and maintainance for each product.

## Features

-   Webpack build
    -   By default it will build into a self contained /dist folder
-   Cleaning
-   Build metrics
-   Server middlewares and helpers
    -   Server side rendering support
-   Hot reloading support
    -   Including server hot reload support!
-   Standalone server for client-only applications

Detailed documentation available in the [docs](./docs) folder:

-   [CLI Commands](./docs/cli.md)
-   [JavaScript API](./docs/api.md)
-   [Configuration and Structure](./docs/config.md)
-   [Building, Running and Debugging](./docs/build.md)
-   [Developing Project Watchtower](./docs/development.md)

## FAQ

### Want sass support?

Check out the example at [examples/ssr-with-sass](examples/ssr-with-sass)

## Environmental Variables

BUILD_CACHE_DISABLED: by default this is false, setting it to true will disable build caching
BUILD_CACHE_DIRECTORY: specfies the build cache directory, by default it is .build-cache in the working directory
