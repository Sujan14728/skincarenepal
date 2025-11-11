#!/bin/bash
# VPS Verification and Setup Check Script
# Run this on your VPS to verify the environment

echo "================================"
echo "VPS Environment Check"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed: $(command -v $1)"
        if [ "$1" = "node" ] || [ "$1" = "npm" ]; then
            echo "  Version: $($1 --version)"
        fi
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✓${NC} $1 service is running"
    else
        echo -e "${RED}✗${NC} $1 service is NOT running"
        return 1
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Directory exists: $1"
        ls -lah "$1"
    else
        echo -e "${RED}✗${NC} Directory does NOT exist: $1"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
    else
        echo -e "${RED}✗${NC} File does NOT exist: $1"
        return 1
    fi
}

echo "1. Checking System Information"
echo "================================"
echo "Hostname: $(hostname)"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "IP Address: $(hostname -I | awk '{print $1}')"
echo "Public IP: $(curl -s ifconfig.me)"
echo ""

echo "2. Checking Required Software"
echo "================================"
check_command node
check_command npm
check_command pm2
check_command nginx
check_command psql
check_command git
echo ""

echo "3. Checking Services"
echo "================================"
check_service nginx
check_service postgresql
echo ""

echo "4. Checking Users"
echo "================================"
if id "deployer" &>/dev/null; then
    echo -e "${GREEN}✓${NC} User 'deployer' exists"
    groups deployer
else
    echo -e "${RED}✗${NC} User 'deployer' does NOT exist"
fi
echo ""

echo "5. Checking Application Directory"
echo "================================"
check_directory "/var/www/skincarenepal"
check_file "/var/www/skincarenepal/.env"
echo ""

echo "6. Checking Database"
echo "================================"
sudo -u postgres psql -c "\l" | grep skincarenepal && echo -e "${GREEN}✓${NC} Database 'skincarenepal' exists" || echo -e "${RED}✗${NC} Database 'skincarenepal' does NOT exist"
echo ""

echo "7. Checking Nginx Configuration"
echo "================================"
check_file "/etc/nginx/sites-available/skincarenepal"
if [ -L "/etc/nginx/sites-enabled/skincarenepal" ]; then
    echo -e "${GREEN}✓${NC} Nginx site is enabled"
else
    echo -e "${RED}✗${NC} Nginx site is NOT enabled"
fi
echo ""

echo "8. Checking Firewall"
echo "================================"
sudo ufw status
echo ""

echo "9. Checking PM2 Processes"
echo "================================"
pm2 list
echo ""

echo "10. Checking Disk Space"
echo "================================"
df -h
echo ""

echo "11. Checking Memory Usage"
echo "================================"
free -h
echo ""

echo "12. Checking Network Connectivity"
echo "================================"
ping -c 3 google.com
echo ""

echo "================================"
echo "Check Complete!"
echo "================================"
