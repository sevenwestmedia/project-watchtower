/** We expect to run to be run directly in the output directory
 * For example /dist/
 * If this is not the case (for example local development)
 * Then BASE_DIR should be specified.
 * It is automatically set by start
 */
export const getBaseDir = () => {
    return process.env.BASE_DIR || process.cwd()
}

export const setBaseDir = (baseDir: string) => {
    process.env.BASE_DIR = baseDir
}
