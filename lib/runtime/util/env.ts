export const isBuildServer = () => {
    // TeamCity build server
    // https://confluence.jetbrains.com/display/TCD10/Predefined+Build+Parameters
    if (process.env.TEAMCITY_VERSION) {
        return true
    }

    // Jenkins build server
    // https://wiki.jenkins-ci.org/display/JENKINS/Building+a+software+project
    if (process.env.JENKINS_URL) {
        return true
    }

    return false
}
