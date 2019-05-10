// This file is part of the research.fi service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT
node {
  def api_host = "${env.API_HOST}"
  def artifactory_server = "${env.ARTIFACTORY_SERVER}"
  def registry = "${env.DOCKER_REGISTRY}"
  def dockerfile = "Dockerfile.prod"
  def imagename = "researchfi-frontend"
  def tag = "latest"
  def docker_image = "${registry}/${imagename}:${tag}"

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
    // There's a bug in Docker Pipeline Plugin, which crashes during multistage Docker build.
    // https://github.com/jenkinsci/docker-workflow-plugin/pull/162
    // Before that issue is fixed, execute docker build using shell script.
    // def newImage = docker.build(docker_image, "-f ${dockerfile} .")
    sh "docker build -f ${dockerfile} -t ${docker_image} ."
  }

  stage('Push Docker image') {
    withDockerRegistry(url: "https://${registry}", credentialsId: 'artifactory-credentials') {
      sh "docker push ${docker_image}"
    }
  }
}