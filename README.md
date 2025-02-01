# ByteVault: Secure File Storage with Advanced Security Pipeline

A secure file storage application with comprehensive security scanning pipeline powered by Trend Micro Artifact Scanner.

## Features

### Application
- Secure user authentication with role-based access (admin/user)
- File upload and management system
- Interactive dashboard interface
- Session-based authentication
- Responsive design with Tailwind CSS
- Node.js + Express backend
- Kubernetes deployment ready

### Security Pipeline
- Multiple security scan types:
  - Vulnerability assessment
  - Malware detection
  - Secret scanning
  - SBOM generation
- Two security modes:
  - `protect`: Blocks deployment on security findings
  - `log`: Documents findings without blocking

### Infrastructure
- Container-based deployment
- AWS ECR for container registry
- EKS for Kubernetes orchestration
- LoadBalancer service for external access

## Repository Structure
```
.
├── Dockerfile              # Container build configuration
├── server.js              # Express server implementation
├── package.json           # Node.js dependencies
├── public/                # Static files
│   ├── login.html        # Login interface
│   ├── dashboard.html    # Main application interface
│   ├── styles.css        # Application styling
│   └── script.js         # Client-side functionality
├── k8s/                  # Kubernetes configurations
│   ├── deployment.yaml   # Pod deployment configuration
│   └── service.yaml      # Service configuration
├── .github/workflows/    # CI/CD pipeline
│   └── docker-build-push.yml
└── README.md
```

## Prerequisites

### AWS Configuration
1. ECR repository for container images
2. EKS cluster for deployment
3. IAM credentials with permissions for:
   - ECR push/pull
   - EKS cluster management

### GitHub Configuration
Required secrets:
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `ECR_REPOSITORY_NAME`: ECR repository name
- `TMAS_API_KEY`: Trend Micro Artifact Scanner API key
- `ADMIN_PASSWORD`: Admin user password
- `USER_PASSWORD`: Regular user password

Required variables:
- `AWS_REGION`: AWS region for services
- `EKS_CLUSTER_NAME`: EKS cluster name
- `SECURITY_MODE`: Pipeline mode (`protect`/`log`)
- `ADMIN_USERNAME`: Admin username
- `USER_USERNAME`: Regular user username

## Application Access

The application is accessible through the LoadBalancer URL:
```bash
# Get service URL
kubectl get service bytevault-service

# Access the application
http://<EXTERNAL-IP>:3000
```

### Authentication
- Admin login: Use ADMIN_USERNAME and ADMIN_PASSWORD
- User login: Use USER_USERNAME and USER_PASSWORD

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=your_admin_password
export USER_USERNAME=user
export USER_PASSWORD=your_user_password
```

3. Run the application:
```bash
npm start
```

4. Access at `http://localhost:3000`

## Deployment Flow

1. Push to main branch triggers the CI/CD pipeline
2. Pipeline stages:
   - Build Docker image
   - Push to ECR
   - Run security scans:
     - Vulnerability assessment
     - Malware detection
     - Secret scanning
     - SBOM generation
   - Deploy to EKS (if security checks pass)

## Monitoring

Check deployment status:
```bash
# View deployments
kubectl get deployments

# View services
kubectl get services

# Check pods
kubectl get pods

# View logs
kubectl logs <pod-name>
```

## Security Modes

Configure pipeline behavior with SECURITY_MODE:
```bash
# Fail on security findings
SECURITY_MODE=protect

# Log findings only
SECURITY_MODE=log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Submit Pull Request

## License

GNU General Public License v3.0 (GPLv3)
