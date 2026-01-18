FROM jenkins/jenkins:lts


# ... (top of file)
USER root

# Install necessary system tools
RUN apt-get update && apt-get install -y \
    lsb-release \
    python3-pip \
    python3-venv \
    python3-full \
    curl \
    wget \
    unzip \
    gnupg
# ... (rest of file)

# Install necessary system tools
RUN apt-get update && apt-get install -y \
    lsb-release \
    python3-pip \
    curl \
    wget \
    unzip \
    gnupg

# Install Terraform
RUN wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | tee /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list && \
    apt-get update && apt-get install -y terraform

# Install Trivy
# Install Trivy
RUN wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | tee /usr/share/keyrings/trivy.gpg > /dev/null && \
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb bookworm main" | tee /etc/apt/sources.list.d/trivy.list && \
    apt-get update && apt-get install -y trivy

# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install

# Add jenkins user to docker group
RUN usermod -aG docker jenkins

USER jenkins
