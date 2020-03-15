/**
 * Returns true if server is running inside watchtower
 *
 * The built server expects the cwd to be the dist folder, when running inside watchtower this is not the case
 */
export function isWatchtowerServer() {
    return process.env.WATCHTOWER_SERVER === 'true'
}

export function projectDir() {
    return process.env.PROJECT_DIR || process.cwd()
}

export function isWatchMode() {
    return process.env.START_WATCH_MODE === 'true'
}
