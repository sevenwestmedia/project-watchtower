/**
 * This file exits the process with a return code supplied
 * as CLI argument to test erroring child processes
 */
const returnCode = parseInt(process.argv[2] || '0', 10)
process.exit(returnCode)
