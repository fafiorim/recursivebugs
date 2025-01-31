# ByteVault - Secure File Storage with GitOps Pipeline

This repository demonstrates a secure GitOps pipeline for deploying ByteVault, a file storage application, using Trend Micro Artifact Scanning and GitHub Actions.

## Features

- **ByteVault Application**
  - Secure file upload and storage
  - User authentication (admin/user roles)
  - File management interface
  - Built with Node.js and Express

- **Security Pipeline**
  - Multiple scan types: vulnerabilities, malware, secrets, SBOM
  - Two security modes:
    - `protect`: Fails pipeline on security findings
    - `log`: Documents findings without blocking deployment
  - AWS ECR integration for image storage
  - EKS deployment with security checks

## Repository Structure

```text
.
├── Dockerfile
├── server.js
├── package.json
├── public/
│   ├── login.html
│   ├── dashboard.html
│   ├── styles.css
│   └── script.js
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── .github/workflows/
│   └── docker-build-push.yml
└── README.md
```

## Prerequisites

1. **AWS Account**
   - ECR repository
   - EKS cluster
   - IAM credentials

2. **Trend Micro Artifact Scan**
   - TMAS API key

3. **GitHub Repository Configuration**
   - **Secrets:**
     - AWS_ACCESS_KEY_ID
     - AWS_SECRET_ACCESS_KEY
     - ECR_REPOSITORY_NAME
     - TMAS_API_KEY
   - **Variables:**
     - AWS_REGION
     - EKS_CLUSTER_NAME
     - SECURITY_MODE (protect/log)

## Application Usage

- **Login Credentials:**
  - Admin: username=admin, password=&f0f482d*2d18
  - User: username=user, password=&f0f482da2d18

## Pipeline Overview

1. **Build**: Packages Node.js application into Docker image
2. **Push**: Uploads image to AWS ECR
3. **Security Scans**: 
   - Vulnerabilities
   - Malware
   - Secrets
   - SBOM generation
4. **Deploy**: EKS deployment if security checks pass (or in log mode)

## Security Modes

### Protect Mode (Default)
- Fails pipeline on:
  - Critical vulnerabilities
  - Malware detection
  - Secret detection
- Prevents compromised images from deploying

### Log Mode
- Reports security findings
- Continues pipeline execution
- Useful for testing and evaluation

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## License

GNU General Public License v3.0 (GPLv3)
