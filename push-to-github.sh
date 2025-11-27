#!/bin/bash
# Script to push code to GitHub using Personal Access Token

echo "=========================================="
echo "GitHub Push Helper"
echo "=========================================="
echo ""
echo "To push your code, you need a Personal Access Token."
echo ""
echo "Steps to create a token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' -> 'Generate new token (classic)'"
echo "3. Give it a name (e.g., 'solana_naming_service')"
echo "4. Select scope: 'repo' (check the box)"
echo "5. Click 'Generate token'"
echo "6. COPY THE TOKEN (you won't see it again!)"
echo ""
echo "=========================================="
echo ""

read -p "Enter your GitHub Personal Access Token: " token

if [ -z "$token" ]; then
    echo "Error: Token cannot be empty"
    exit 1
fi

# Use token in URL for authentication
git remote set-url origin https://${token}@github.com/saurabh-yadav7797/solana_naming_service.git

echo ""
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "Repository: https://github.com/saurabh-yadav7797/solana_naming_service"
    # Reset remote URL to remove token
    git remote set-url origin https://github.com/saurabh-yadav7797/solana_naming_service.git
else
    echo ""
    echo "❌ Push failed. Please check your token and try again."
    # Reset remote URL
    git remote set-url origin https://github.com/saurabh-yadav7797/solana_naming_service.git
    exit 1
fi

