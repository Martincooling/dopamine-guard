# Uploading Dopamine Guard to GitHub

This guide shows two simple ways to put Dopamine Guard on GitHub.

## Option A: GitHub CLI

Use this if you have the GitHub CLI installed and are already logged in.

```bash
cd dopamine-guard
git init
git add .
git commit -m "Initial commit"
gh repo create dopamine-guard --public --source=. --remote=origin --push
```

To make the repository private instead, use:

```bash
gh repo create dopamine-guard --private --source=. --remote=origin --push
```

## Option B: Git command line + GitHub website

1. Create a new empty repository on GitHub named `dopamine-guard`.
2. Do not initialize it with a README, license, or `.gitignore`, because this folder already has project files.
3. In your terminal, run:

```bash
cd dopamine-guard
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dopamine-guard.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Option C: GitHub web upload

1. Create a new repository on GitHub.
2. Click **Add file** → **Upload files**.
3. Drag the contents of the `dopamine-guard` folder into the upload area.
4. Commit the uploaded files.

The command-line options are better because they preserve normal Git history from the start.
