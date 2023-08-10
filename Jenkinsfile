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
                sh 'docker-compose up -d'
            }
        }
    }
}