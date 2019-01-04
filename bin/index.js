#!/usr/bin/env node

/*
 * This file can not be TypeScript as transpiling replace the line endings
 * with CRLF on Windows, which breks the shebang line on linux/unix!
 */

require('../dist/cjs/bin/_pwt')
