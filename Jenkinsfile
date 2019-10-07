// This file is part of the research.fi service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT
node {
  /*
   * Set Jenkins properties.
   * - Discard old build logs after specified time
   */
  properties(
    [
      buildDiscarder(
        logRotator(
          numToKeepStr: '10'
        )
      )
    ]
  )

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
  // Git commit hash to be used as a tag for the Docker image. Get the hash using shell script.
  def git_commit_hash = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
  // Docker image tags 
  def tag_githash = "${registry}/${imagename}/${branchname}:${git_commit_hash}"
  def tag_latest = "${registry}/${imagename}/${branchname}:latest"

  /*
   * Wrap stages in try-catch-finally.
   * Clean up of Docker images is in the 'finally' block, so that it will be always executed even if the script fails inside some stage.
   */
  try {

    /*
     * Print environment variables for Jenkins pipeline debugging purposes.
     */
    stage('Print environment variables') {
      echo sh(returnStdout: true, script: 'env')
    }

    /*
     * Angular application requires configuration file 'src/assets/config.json', which is not included in the Git repository.
     * Create the file from template file 'src/assets/config_template.json'
     * - replace string '<API_URL>' with variable 'api_host'
     * - replace string '<BUILD_INFO>' with variable 'build_info'
     *
     * Build info consists of timestamp and Git commit hash. Environment variable BUILD_TIMESTAMP comes from Jenkins plugin 'Build Timestamp'.
     */
    stage('Add production environment file') {
      def build_info = "${env.BUILD_TIMESTAMP} ${git_commit_hash}"

      // Create config.json
      sh "sed 's|<API_HOST>|${api_host}|g;s|<BUILD_INFO>|${build_info}|g' src/assets/config/config_template.json > src/assets/config/config.json"
      sh 'ls -l src/assets/config/config.json'
      sh 'cat src/assets/config/config.json'
    }

    /*
     * Build and tag Docker image
     */
    stage('Build and tag Docker image') {
      // There's a bug in Docker Pipeline Plugin, which crashes during multistage Docker build.
      // https://github.com/jenkinsci/docker-workflow-plugin/pull/162
      // Before that issue is fixed, execute docker build using shell script.

      // def newImage = docker.build(docker_image, "-f ${dockerfile} .")
      sh "docker build -f ${dockerfile} -t ${tag_githash} -t ${tag_latest} ."
    }

    /*
     * Push Docker image to registry only if Git branch is 'master' or 'devel'
     */
    if ("${branchname}" == "master" || "${branchname}" == "devel") {
      stage('Push Docker image') {
        withDockerRegistry(url: "https://${registry}", credentialsId: 'artifactory-credentials') {
          //sh "docker push ${tag_githash}"
          sh "docker push ${tag_latest}"
        }
      }
    }
  } catch (e) {
    /*
     * Throw error 
     */
    throw e
  } finally {
    /*
     * Cleanup. Delete Docker images.
     */
    stage('Cleanup') {
      sh 'docker images'
      sh "docker rmi ${tag_githash}"
      sh "docker rmi ${tag_latest}"
      sh 'docker images'
    }
  }
}