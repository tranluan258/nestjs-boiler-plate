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
                sh 'npm install'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh 'docker-compose up -d --build'
            }
        }
    }
}