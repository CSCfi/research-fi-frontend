// This file is part of the research.fi service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT
node {
  /*
   * Get source files from Git repository.
   */
  stage('Get source files from Git') {
    checkout scm
  }

  // API address injected into Angular app
  def api_host = "${env.API_HOST}"
  // Artifactory server
  def artifactory_server = "${env.ARTIFACTORY_SERVER}"
  // Docker registry in the Artifactory
  def registry = "${env.DOCKER_REGISTRY}"
  // Dockerfile name in the Git repository
  def dockerfile = "Dockerfile.prod"
  // Docker image name
  def imagename = "researchfi-frontend"
  // Git branch name. Converted to lowercase letters to prevent problems when creating Docker image.
  def branchname = "${env.BRANCH_NAME}".toLowerCase()
  // Tag for the Docker image. Get Git commit hash using shell script.
  def tag = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
  // Full Docker image 
  def docker_image = "${registry}/${imagename}/${branchname}:${tag}"

  /*
   * Print environment variables for Jenkins pipeline debugging purposes.
   */
  stage('Print environment variables') {
    echo sh(returnStdout: true, script: 'env')
  }

  /*
   * Angular application requires configuration file 'environment.prod.ts', which is not included in the Git repository.
   * Create the file and replace string '<API_URL>' with variable 'api_host'.
   */
  stage('Add production environment file') {
    sh "sed 's/<API_HOST>/${api_host}/g' src/environments/environment.prod.ts > src/environments/environment.researchfi.prod.ts"
    sh 'ls -l src/environments'
    sh 'cat src/environments/environment.researchfi.prod.ts'  
  }

  /*
   * Build and tag Docker image
   */
  stage('Build and tag Docker image') {
    // There's a bug in Docker Pipeline Plugin, which crashes during multistage Docker build.
    // https://github.com/jenkinsci/docker-workflow-plugin/pull/162
    // Before that issue is fixed, execute docker build using shell script.

    // def newImage = docker.build(docker_image, "-f ${dockerfile} .")
    sh "docker build -f ${dockerfile} -t ${docker_image} ."
  }

  /*
   * Push Docker image to registry only if Git branch is 'master' or 'devel'
   */
  if (env.GIT_BRANCH == 'master' || env.GIT_BRANCH == 'devel') {
    stage('Push Docker image') {
      withDockerRegistry(url: "https://${registry}", credentialsId: 'artifactory-credentials') {
        sh "docker push ${docker_image}"
      }
    }
  }

  /*
   * Cleanup. Delete unused Docker items: containers, images etc.
   */
  stage('Cleanup') {
    sh 'docker system prune -f'
  }
}