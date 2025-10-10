output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.bytevault.repository_url
}

output "eks_cluster_endpoint" {
  description = "Endpoint for EKS cluster"
  value       = aws_eks_cluster.bytevault.endpoint
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.bytevault.name
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_security_group.bytevault_sg.id
}

