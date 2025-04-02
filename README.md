# Cypress Project

## Overview
This repository is for the development and testing of the **CPS406 Project** using Cypress for end-to-end testing. The project is implemented with **Vite, React, Tailwind CSS, and Firebase**.

## Installation
To set up the project on your local machine, follow these steps:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```
2. **Navigate to the project folder**
   ```bash
   cd cps406-project
   ```
3. **Install dependencies** (Use the legacy or force flag due to an outdated Google Autocomplete API for React v19)
   ```bash
   npm i --legacy-peer-deps OR npm i --force
   ```

##**NOTE:
- For some reason the .env.local file did not get pushed to the github, so add this file with the API keys in your local repo to get the site working. The file is in the Discord.

## Development
To start the development server:
```bash
npm run dev
```

## Branching and Collaboration Guidelines
To maintain a clean workflow:
1. **Create a new branch for changes**
   ```bash
   git checkout -b feature-branch
   ```
   (Replace `feature-branch` with a meaningful name, e.g., `add-auth`, `fix-navbar`.)

2. **Make changes and test locally**
   - Modify code as needed.
   - Run the application with `npm run dev`.

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

4. **Push the branch to GitHub**
   ```bash
   git push origin feature-branch
   ```

5. **Create a Pull Request**
   - Navigate to the repository on GitHub.
   - Click **Pull Requests** > **New Pull Request**.
   - Set `feature-branch` as the source and `main` as the target.
   - Click **Create Pull Request** and request a review.

## Keeping Your Branch Updated
To pull the latest changes from `main` before starting new work:
```bash
git checkout main
git pull origin main
git checkout feature-branch
git merge main  # Merge the latest changes from main
```

## Testing with Cypress
1. **Run Cypress tests in interactive mode:**
   ```bash
   npx cypress open
   ```
2. **Run Cypress tests in headless mode:**
   ```bash
   npx cypress run
   ```

## Notes
- **Do not push directly to `main`**; always work on a separate branch and create a pull request.
- Follow best practices for code quality and testing before submitting pull requests.

---
This README provides guidelines for setting up, developing, and deploying the project efficiently. 🚀
