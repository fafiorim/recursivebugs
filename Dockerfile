# Use the official NGINX image from Docker Hub
FROM debian@sha256:c11d2593cb741ae8a36d0de9cd240d13518e95f50bccfa8d00a668c006db181e

RUN echo "X5O!P%@AP[4\\PZX54(P^)7CC)7}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H+H*" > /tmp/eicar.com

# Copy the welcome page HTML to the NGINX default directory
COPY index.html /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80
