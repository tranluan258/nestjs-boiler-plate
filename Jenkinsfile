pipeline {
    agent any
    tools {
        nodejs 'my-nodejs'
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                sh 'docker --version'
                sh 'npm install'
                sh 'sudo /usr/local/bin/docker-compose up -d'
            }
        }
    }
}