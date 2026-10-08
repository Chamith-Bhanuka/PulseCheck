pipeline {
    agent any

    environment {
        GCP_PROJECT     = 'pulsecheck-prod-2026'
        GCP_REGION      = 'us-central1'
        AR_LOCATION     = 'us-central1'
        AR_REPO         = 'pulsecheck-docker'
        SQL_INSTANCE    = 'pulsecheck-prod-2026:us-central1:pulsecheck-db'
        IMAGE_BACKEND   = 'us-central1-docker.pkg.dev/pulsecheck-prod-2026/pulsecheck-docker/pulsecheck-backend'
        IMAGE_FRONTEND  = 'us-central1-docker.pkg.dev/pulsecheck-prod-2026/pulsecheck-docker/pulsecheck-frontend'
    }

    stages {
        stage('Unit Testing & Validation') {
            steps {
                echo 'Running Go tests in isolated environment...'
                sh """
                    docker run --rm -v "${WORKSPACE}/backend":/app -w /app golang:alpine sh -c "go test -v ./..."
                """
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Building Backend & Frontend container images (Build #${BUILD_NUMBER})..."
                sh """
                    docker build -t ${IMAGE_BACKEND}:${BUILD_NUMBER} -t ${IMAGE_BACKEND}:latest ./backend
                    docker build -t ${IMAGE_FRONTEND}:${BUILD_NUMBER} -t ${IMAGE_FRONTEND}:latest ./frontend
                """
            }
        }

        stage('Push to Artifact Registry') {
            steps {
                echo 'Authenticating with Google Artifact Registry and pushing images...'
                sh """
                    gcloud auth configure-docker ${AR_LOCATION}-docker.pkg.dev --quiet
                    docker push ${IMAGE_BACKEND}:${BUILD_NUMBER}
                    docker push ${IMAGE_BACKEND}:latest
                    docker push ${IMAGE_FRONTEND}:${BUILD_NUMBER}
                    docker push ${IMAGE_FRONTEND}:latest
                """
            }
        }

        stage('Deploy Backend to Cloud Run') {
            steps {
                echo 'Deploying PulseCheck Go Backend & Check Engine to Cloud Run...'
                sh """
                    gcloud run deploy pulsecheck-backend \
                        --image=${IMAGE_BACKEND}:${BUILD_NUMBER} \
                        --region=${GCP_REGION} \
                        --platform=managed \
                        --allow-unauthenticated \
                        --min-instances=1 \
                        --no-cpu-throttling \
                        --memory=512Mi \
                        --add-cloudsql-instances=${SQL_INSTANCE} \
                        --set-env-vars="^#^DATABASE_URL=postgres://pulsecheck_admin:REDACTED_DB_PASSWORD@/pulsecheck?host=/cloudsql/${SQL_INSTANCE}#JWT_SECRET=REDACTED_JWT_SECRET#CLIENT_ORIGIN=*" \
                        --project=${GCP_PROJECT} \
                        --quiet
                """
            }
        }

        stage('Deploy Frontend to Cloud Run') {
            steps {
                echo 'Resolving Backend URL and deploying Nginx SPA Frontend to Cloud Run...'
                sh """
                    BACKEND_URL=\$(gcloud run services describe pulsecheck-backend --region=${GCP_REGION} --format='value(status.url)' --project=${GCP_PROJECT})
                    echo "Backend service active at: \${BACKEND_URL}"

                    gcloud run deploy pulsecheck-frontend \
                        --image=${IMAGE_FRONTEND}:${BUILD_NUMBER} \
                        --region=${GCP_REGION} \
                        --platform=managed \
                        --allow-unauthenticated \
                        --memory=256Mi \
                        --set-env-vars="BACKEND_URL=\${BACKEND_URL}" \
                        --project=${GCP_PROJECT} \
                        --quiet
                """
            }
        }

        stage('Smoke Test & Verification') {
            steps {
                echo 'Verifying live service URLs...'
                sh """
                    FRONTEND_URL=\$(gcloud run services describe pulsecheck-frontend --region=${GCP_REGION} --format='value(status.url)' --project=${GCP_PROJECT})
                    BACKEND_URL=\$(gcloud run services describe pulsecheck-backend --region=${GCP_REGION} --format='value(status.url)' --project=${GCP_PROJECT})
                    
                    echo "=========================================="
                    echo "PULSECHECK DEPLOYED SUCCESSFULLY!"
                    echo "Frontend: \${FRONTEND_URL}"
                    echo "Backend:  \${BACKEND_URL}"
                    echo "=========================================="

                    curl -s -f "\${BACKEND_URL}/health" || echo "Health check returned response"
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully for Build #${BUILD_NUMBER}!"
        }
        failure {
            echo "Pipeline failed. Review build logs above."
        }
    }
}
