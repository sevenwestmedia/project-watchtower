# Developing Project Watchtower

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
