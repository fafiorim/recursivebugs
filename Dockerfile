# Use the official NGINX image from Docker Hub
FROM nginx:alpine

# If want to test the check for malware.
RUN echo "X5O!P%@AP[4\\PZX54(P^)7CC)7}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H+H*" > /tmp/eicar.com

#If want to test for Secret scanning:
RUN echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjaWQiOiI1NzM5NDY1MS01ZjgwLTQ3YjgtOGUyMS0zN2FkZjM5OGRlZmQiLCJjcGlkIjoic3ZwIiwicHBpZCI6ImN1cyIsIml0IjoxNzIyNDQxOTIyLCJldCI6MTc1Mzk3NzkyMSwiaWQiOiJjYmRkYWViMi0zNzNhLTQ5YjYtYjU5Ny03OWE5YzVkYjVlM2YiLCJ0b2tlblVzZSI6ImN1c3RvbWVyIn0.Jqua_uEpVMN3cnW0BVr8nUtey1aBOFTay7sEQOCCPkNgd6fL3O_Er_gyUTPicWupgoDeyd3UBP2enVDiWcepVOe2U0PKDnJbX6q140hkdL005B4t0h3rNjUBkjoizpsxvw8hjaaS3YVliZXZMQ8gLgC3xZ9KIHu2Mcqy6iwiFsMm6MccMAXCx1wbliUUNRIL3uBFQC2iPqiJUgeXDIiqFsXZpeqtya761FxPd69nRAZoYBR9-" > /tmp/token

# (Optional) Install anything you need inside the container
RUN apk update && apk add --no-cache curl

# Create a random file so each build has a new digest
RUN echo $RANDOM > /tmp/random-build-file

# Copy the welcome page HTML to the NGINX default directory
COPY index.html /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80
