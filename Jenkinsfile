// This file is part of the research.fi service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT
node {
  def api_host = "${env.API_HOST}"
  def registry = "${env.DOCKER_REGISTRY}"
  def imagename = "researchfi-frontend"
  def dockerfile = "Dockerfile.prod"
  def docker_image = "${registry}/${imagename}:testing"

  stage('Print environment variables') {
    echo sh(returnStdout: true, script: 'env')
  }
  
  stage('Clone repository') {
    checkout scm
  }

  stage('Add production environment file') {
    sh "sed 's/<API_HOST>/${env.API_HOST}/g' src/environments/environment.prod.ts > src/environments/environment.researchfi.prod.ts"
    sh 'ls -l src/environments'
    sh 'cat src/environments/environment.researchfi.prod.ts'  
  }

  stage('Build Docker image') {
    //def newImage = docker.build(docker_image, "-f ${dockerfile} .")
    sh "docker build -t ${docker_image} -f ${dockerfile}"
  }
}