# @project-watchtower/cli

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
