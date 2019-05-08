// This file is part of the research.fi service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT
node {
  def registry = "${env.DOCKER_REGISTRY}"
  def imagename = "researchfi-frontend"
  def docker_image = "${registry}/${imagename}:testing"

  stage('Print environment variables') {
    echo sh(returnStdout: true, script: 'env')
  }
  
  stage('Clone repository') {
    checkout scm
  }

  stage('Build Docker image') {
    def newImage = docker.build(docker_image, "./Dockerfile.prod")
  }
}