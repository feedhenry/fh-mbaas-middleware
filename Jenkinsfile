#!groovy

// https://github.com/feedhenry/fh-pipeline-library
@Library('fh-pipeline-library') _

node('nodejs6') {

    step([$class: 'WsCleanup'])

    stage ('Checkout') {
        checkout scm
    }

    stage('Install Dependencies') {
        npmInstall {}
    }

    stage('Unit Tests') {
            sh 'grunt fh:unit'
    }

    stage('Integration Tests') {
        print "Integration tests are disabled due to https://issues.jboss.org/browse/FH-4218"
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
