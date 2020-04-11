---
'@project-watchtower/cli': patch
'@project-watchtower/runtime': patch
'@project-watchtower/server': patch
---

Fixed function timer being in server package, causing clients to fail when included. Increased client dev build log level
