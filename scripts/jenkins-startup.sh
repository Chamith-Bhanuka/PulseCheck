#!/bin/bash
set -e

# Update and install Docker & dependencies
apt-get update -y
apt-get install -y ca-certificates curl gnupg git jq

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

# Ensure docker socket permissions for container
chmod 666 /var/run/docker.sock

# Prepare custom Jenkins Dockerfile with Docker CLI and Google Cloud SDK
mkdir -p /opt/jenkins-build
cat << 'EOF' > /opt/jenkins-build/Dockerfile
FROM jenkins/jenkins:lts
USER root

# Install Docker CLI and Google Cloud SDK
RUN apt-get update -y && \
    apt-get install -y ca-certificates curl gnupg apt-transport-https && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    apt-get update -y && \
    apt-get install -y docker-ce-cli google-cloud-cli && \
    rm -rf /var/lib/apt/lists/*

# Add jenkins user to docker group
RUN groupadd -g 999 docker_host || true && usermod -aG docker_host jenkins || true

USER jenkins
EOF

cd /opt/jenkins-build
docker build -t pulsecheck-jenkins:latest .

# Create Jenkins home on host
mkdir -p /var/jenkins_home
chown -R 1000:1000 /var/jenkins_home

# Run customized Jenkins container
docker rm -f jenkins || true
docker run -d \
  --name jenkins \
  --restart always \
  -p 8080:8080 \
  -p 50000:50000 \
  -v /var/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  pulsecheck-jenkins:latest

# Log initial admin password for easy retrieval
echo "Waiting for Jenkins to generate admin password..."
sleep 25
cat /var/jenkins_home/secrets/initialAdminPassword > /var/log/jenkins_initial_password.txt || true
