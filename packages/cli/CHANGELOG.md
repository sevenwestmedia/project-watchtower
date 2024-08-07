# @project-watchtower/cli

## 2.0.0-beta.22

### Minor Changes

-   36b4b58: Updated to compile with 'ESNext' instead of 'ES2015', and updated dependency for 'esbuild-loader'.

## 2.0.0-beta.21

### Major Changes

-   10f6680: Updated packages to use Node18, Webpack5, TSLib 2.6 & all other necessary packages to support these changes.
    Only update to this version of project-watchtower if your project is currently running on the latest versions of
    these packages. To see a list of all the changes that were made, check out the pull request at:
    https://github.com/sevenwestmedia/project-watchtower/pull/101

## 2.0.0-beta.20

### Patch Changes

-   de81fce: Bump webpack-hot-middleware from 2.25.0 to 2.25.1 to fix transitive dependency on ansi-html

## 2.0.0-beta.19

### Patch Changes

-   3f98adb: Bump versions for dependency updates

## 2.0.0-beta.18

### Major Changes

-   8b4eb3d: Client-side render now uses `format: iife` to prevent global namespace pollution

## 2.0.0-beta.17

### Patch Changes

-   ec65558: Switch build target for client/server

## 2.0.0-beta.16

### Major Changes

-   426f34d: Switch from TS-loader to esbuild-loader

## 2.0.0-beta.15

### Patch Changes

-   9f7ba42: Fixed issue where webpack stats errors would not be surfaced to the end user

## 2.0.0-beta.14

### Minor Changes

-   def9104: Don't run lint as part of build/serve

## 2.0.0-beta.13

### Minor Changes

-   b4fdcd7: Upgrade dependencies

## 2.0.0-beta.12

### Patch Changes

-   1bf7ece: Fixed function timer being in server package, causing clients to fail when included. Increased client dev build log level

## 2.0.0-beta.11

### Patch Changes

-   f8f0d6f: Fixed externals - do not cater for deep imports anymore

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
