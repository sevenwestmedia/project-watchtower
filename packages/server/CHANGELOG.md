# @project-watchtower/server

## 2.0.0-beta.15

### Major Changes

-   10f6680: Updated packages to use Node18, Webpack5, TSLib 2.6 & all other necessary packages to support these changes.
    Only update to this version of project-watchtower if your project is currently running on the latest versions of
    these packages. To see a list of all the changes that were made, check out the pull request at:
    https://github.com/sevenwestmedia/project-watchtower/pull/101

## 2.0.0-beta.14

### Patch Changes

-   3f98adb: Bump versions for dependency updates

## 2.0.0-beta.13

### Minor Changes

-   b4fdcd7: Upgrade dependencies

## 2.0.0-beta.12

### Patch Changes

-   20829f5: Fixed issue where the root dir is incorrect for production builds

## 2.0.0-beta.11

### Patch Changes

-   1bf7ece: Fixed function timer being in server package, causing clients to fail when included. Increased client dev build log level

## 2.0.0-beta.10

### Patch Changes

-   53a78bd: Setup webpack to be able to resolve loaders relative to the cli, fixes #8

## 2.0.0-beta.9

### Patch Changes

-   19467e7: Fixed hot reload and server starting in watch mode
-   19467e7: Fixed dependencies list to ensure dependencies get installed into root of consuming project

## 2.0.0-beta.8

### Patch Changes

-   078c57d: Initial release of new packages
