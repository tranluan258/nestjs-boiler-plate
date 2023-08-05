pipeline {
    agent any
    tools {
        nodejs 'my-nodejs'
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building..'
                sh 'npm install'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh 'sudo docker-compose up -d --build'
            }
        }
    }
}