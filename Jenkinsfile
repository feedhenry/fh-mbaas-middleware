#!groovy

// https://github.com/feedhenry/fh-pipeline-library
@Library('fh-pipeline-library') _

fhBuildNode() {
    stage('Install Dependencies') {
        npmInstall {}
    }

    stage('Unit Tests') {
            sh 'grunt fh:unit'
    }

    stage('Integration Tests') {
        print "Integration tests are disabled due to https://issues.jboss.org/browse/RHMAP-18033"
        /*
        withOpenshiftServices(['mongodb']) {
            sh 'grunt fh:integrate'
        }
        */
    }

    stage('Build') {
        gruntBuild {
            name = 'fh-mbaas-middleware'
        }
    }
}
