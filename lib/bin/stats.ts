import buildStats from '../stats'

const stats = (...params: string[]) => {
    const verbose = params.indexOf('verbose') !== -1

    return buildStats(verbose)
}

export default stats
