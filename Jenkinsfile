pipeline {
    agent any
    tools {
        nodejs 'my-nodejs'
        docker 'my-docker'
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
