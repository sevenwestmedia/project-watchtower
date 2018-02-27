# Developing Project Watchtower

## Running tests
To run lighthouse (chrome benchmarking tool) we require chrome running, to be consistent
we use docker to make sure tests are being run against a consistent version.

Run the following commands:

`docker run -d -it --restart unless-stopped -p 9222:9222 --name=chrome-headless -v /tmp/chromedata:/data --shm-size=1gb alpeware/chrome-headless-unstable:ver-63.0.3213.3`

To remove container run
```
docker stop chrome-headless
docker rm chrome-headless
```


## Linking

Linking Project Watchtower into projects with `yarn link` unfortunately does not work. Here's one (hacky) way to test unpublished versions:

Build and pack Project Watchtower into a `.tgz` file:
```
yarn build
npm pack
```

In the project you want to use it, add the `.tgz` file as a dependency:
```
yarn remove project-watchtower
yarn add file:/../project-watchtower-0.0.1.tgz
```

To update:
```
yarn cache clean
rm -rf node_modules
rm yarn.lock
yarn
```
