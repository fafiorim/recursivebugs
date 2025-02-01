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

## RESTful API Reference

ByteVault provides a RESTful API for file operations with both session-based (web interface) and Basic Authentication (API calls) support.

## Authentication Methods

### Session-based Authentication (Web Interface)
```http
POST /login
Content-Type: application/json

{
    "username": "string",
    "password": "string"
}
```

Response:
```json
{
    "success": true,
    "redirect": "/dashboard"
}
```

### Basic Authentication (API)
All API endpoints support HTTP Basic Authentication. Include credentials in the request header:
```
Authorization: Basic <base64(username:password)>
```

## API Endpoints

### Upload File
Upload a file to the storage system.

```http
POST /upload
Authorization: Basic <base64(username:password)>
Content-Type: multipart/form-data

file: <file_data>
```

Response:
```json
{
    "message": "File uploaded successfully",
    "filename": "1707052854321-example.txt",
    "size": 1234,
    "mimetype": "text/plain"
}
```

### List Files
Retrieve a list of all uploaded files.

```http
GET /files
Authorization: Basic <base64(username:password)>
```

Response:
```json
[
    {
        "name": "1707052854321-example.txt",
        "path": "/uploads/1707052854321-example.txt",
        "size": 1234,
        "created": "2024-02-01T10:00:00.000Z",
        "modified": "2024-02-01T10:00:00.000Z"
    }
]
```

### Delete File
Delete a specific file by its filename.

```http
DELETE /files/:filename
Authorization: Basic <base64(username:password)>
```

Response:
```json
{
    "message": "File deleted successfully"
}
```

## Usage Examples

### cURL Examples

```bash
# Upload a file
curl -X POST http://<EXTERNAL-IP>:3000/upload \
  -u "admin:your_password" \
  -F "file=@/path/to/your/file.txt"

# List all files
curl http://<EXTERNAL-IP>:3000/files \
  -u "admin:your_password"

# Delete a file
curl -X DELETE http://<EXTERNAL-IP>:3000/files/1707052854321-example.txt \
  -u "admin:your_password"
```

### Python Examples

#### Using requests Library
```python
import requests
from requests.auth import HTTPBasicAuth

class ByteVaultAPI:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.auth = HTTPBasicAuth(username, password)

    def upload_file(self, filepath):
        """Upload a file to ByteVault."""
        try:
            with open(filepath, 'rb') as f:
                files = {'file': f}
                response = requests.post(
                    f"{self.base_url}/upload",
                    auth=self.auth,
                    files=files
                )
                response.raise_for_status()
                return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Upload failed: {e}")
            return None

    def list_files(self):
        """List all files in ByteVault."""
        try:
            response = requests.get(
                f"{self.base_url}/files",
                auth=self.auth
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to list files: {e}")
            return None

    def delete_file(self, filename):
        """Delete a file from ByteVault."""
        try:
            response = requests.delete(
                f"{self.base_url}/files/{filename}",
                auth=self.auth
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Failed to delete file: {e}")
            return None

# Usage example
if __name__ == "__main__":
    # Initialize API client
    api = ByteVaultAPI(
        base_url="http://<EXTERNAL-IP>:3000",
        username="admin",
        password="your_password"
    )

    # Upload a file
    upload_result = api.upload_file("example.txt")
    if upload_result:
        print(f"File uploaded: {upload_result}")

    # List all files
    files = api.list_files()
    if files:
        print("\nAvailable files:")
        for file in files:
            print(f"- {file['name']} ({file['size']} bytes)")

    # Delete first file in the list
    if files:
        delete_result = api.delete_file(files[0]['name'])
        if delete_result:
            print(f"\nFile deleted: {files[0]['name']}")
```

#### Using httpx Library (Async Example)
```python
import httpx
import asyncio
from pathlib import Path

class AsyncByteVaultAPI:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.auth = (username, password)

    async def upload_file(self, filepath):
        """Upload a file asynchronously."""
        async with httpx.AsyncClient(auth=self.auth) as client:
            files = {'file': open(filepath, 'rb')}
            response = await client.post(
                f"{self.base_url}/upload",
                files=files
            )
            return response.json()

    async def list_files(self):
        """List files asynchronously."""
        async with httpx.AsyncClient(auth=self.auth) as client:
            response = await client.get(f"{self.base_url}/files")
            return response.json()

    async def delete_file(self, filename):
        """Delete a file asynchronously."""
        async with httpx.AsyncClient(auth=self.auth) as client:
            response = await client.delete(
                f"{self.base_url}/files/{filename}"
            )
            return response.json()

async def main():
    api = AsyncByteVaultAPI(
        base_url="http://<EXTERNAL-IP>:3000",
        username="admin",
        password="your_password"
    )

    # Upload multiple files concurrently
    files_to_upload = ["file1.txt", "file2.txt", "file3.txt"]
    upload_tasks = [api.upload_file(f) for f in files_to_upload]
    upload_results = await asyncio.gather(*upload_tasks)
    print("Upload results:", upload_results)

    # List files
    files = await api.list_files()
    print("Available files:", files)

    # Delete files concurrently
    if files:
        delete_tasks = [api.delete_file(f['name']) for f in files]
        delete_results = await asyncio.gather(*delete_tasks)
        print("Delete results:", delete_results)

if __name__ == "__main__":
    asyncio.run(main())
```

## Error Handling

The API uses standard HTTP status codes and returns error messages in JSON format:

```json
// Authentication Error (401)
{
    "error": "Authentication required"
}

// Bad Request (400)
{
    "error": "No file uploaded"
}

// Not Found (404)
{
    "error": "File not found"
}

// Server Error (500)
{
    "error": "Internal server error"
}
```

## Rate Limiting

Currently, there are no rate limits implemented. However, file size limits are enforced by the server configuration.
