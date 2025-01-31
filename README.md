# ByteVault: Secure File Storage with Advanced Security Pipeline

A secure file storage application with comprehensive security scanning pipeline powered by Trend Micro Artifact Scanner.

## Features

### Application
- File upload/download with web interface
- User authentication (admin/user roles)
- File management capabilities
- Node.js + Express backend
- Responsive frontend design

### Security Pipeline
- Multiple security scan types
  - Vulnerability assessment
  - Malware detection
  - Secret scanning
  - SBOM generation
- Two security modes:
  - `protect`: Blocks deployment on security findings
  - `log`: Documents findings without blocking

### Infrastructure
- Container-based deployment
- AWS ECR for image storage
- EKS deployment with security checks
- LoadBalancer service exposure

## Repository Structure
```
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

### AWS Configuration
- ECR repository
- EKS cluster
- IAM credentials with appropriate permissions

### GitHub Configuration
- **Secrets:**
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - ECR_REPOSITORY_NAME
  - TMAS_API_KEY
  - ADMIN_PASSWORD
  - USER_PASSWORD
- **Variables:**
  - AWS_REGION
  - EKS_CLUSTER_NAME
  - SECURITY_MODE (protect/log)
  - ADMIN_USERNAME
  - USER_USERNAME

## Security Pipeline Flow

1. **Build**: Creates Docker image
2. **Push**: Uploads to AWS ECR
3. **Security Scans**: 
   - If `protect` mode: stops on any findings
   - If `log` mode: documents findings and continues
4. **Deploy**: EKS deployment if checks pass

## Usage

### Access Credentials
- Admin access: `${{ vars.ADMIN_USERNAME }}`
- User access: `${{ vars.USER_USERNAME }}`

### Deployment
```bash
# View deployments
kubectl get deployments -o wide

# View services
kubectl get services -o wide

# Check pods
kubectl get pods -o wide
```

### Security Modes
```bash
# Set protect mode
SECURITY_MODE=protect

# Set log mode
SECURITY_MODE=log
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Submit Pull Request

## License

GNU General Public License v3.0 (GPLv3)
