## Overview

Automated deployment triggered by Git pushes streamlines continuous integration workflows, especially when dealing with multiple active branches. This guide reveals a straightforward setup to support multi-branch deployment via a bare Git repository on a Linux server, using shell scripts within Git hooks.

---

## 1. Create a Dedicated Git User for Deployment

For security and isolation, create a system user with restricted shell access:

```bash
useradd git
passwd git
# Restrict to git-shell to prevent arbitrary login
vi /etc/passwd
# Change git's login shell to /usr/bin/git-shell:
git:x:1000:1000::/home/git:/usr/bin/git-shell
```

This prevents direct shell login and confines the user to Git command execution only.

---

## 2. Initialize a Bare Git Repository on Server

A bare repository acts as the centralized source for all incoming pushes. Initialize it as follows:

```bash
git init --bare /opt/webapps/project-bare.git
cd /opt/webapps/project-bare.git/hooks
cp post-update.sample post-update
vi post-update
```

---

## 3. Implement Multi-Branch Deployment in `post-update` Hook

The `post-update` hook triggers after every push to update the working deployment directory according to the branch pushed. Below is a refined shell script:

```sh
#!/bin/sh

unset GIT_DIR
WORK_DIR="/opt/webapps/project"
mkdir -p ${WORK_DIR}
cd ${WORK_DIR} || exit 1

# Identify current and target branches
CURR_BRANCH=$(git symbolic-ref --short -q HEAD)
TARGET_REF="$1"
TARGET_BRANCH=$(echo "${TARGET_REF}" | awk -F/ '{print $3}')

echo "Current branch: ${CURR_BRANCH}"
echo "Target branch: ${TARGET_BRANCH}"

# Initialize repo if not exists
if [ ! -d .git ]; then
git init
# Add remote pointing to the bare repo
 git remote add origin /opt/webapps/project-bare.git
fi

# Reset and clean to avoid conflicts
 git reset --hard
 git clean -df

# Fetch latest from origin
 git fetch origin

# Handle deleted branches (remote ref missing)
if [ ! -f "/opt/webapps/project-bare.git/refs/heads/${TARGET_BRANCH}" ]; then
 echo "Branch ${TARGET_BRANCH} deleted upstream."
 if [ "${TARGET_BRANCH}" = "${CURR_BRANCH}" ]; then
   git checkout master
 fi
 git branch -D "${TARGET_BRANCH}" > /dev/null 2>&1 || true
else
 if [ "${TARGET_BRANCH}" = "${CURR_BRANCH}" ]; then
   echo "On updated branch ${TARGET_BRANCH}, rebasing..."
   git rebase origin/${TARGET_BRANCH}
 else
   echo "Switching to branch ${TARGET_BRANCH}"
   git branch -D "${TARGET_BRANCH}" > /dev/null 2>&1 || true
   git checkout -b "${TARGET_BRANCH}" origin/${TARGET_BRANCH}
 fi
fi

echo "Git pull and sync complete."

# Deployment steps — adjust as per your app's build process
npm install
rm -rf dist
npm run build
pm2 restart project

echo "Deployment completed successfully."
```

---

## 4. Setup Permissions

Make sure the Git user owns the repository and deployment directory:

```bash
chown -R git:git /opt/webapps/project-bare.git
mkdir -p /opt/webapps/project
chown -R git:git /opt/webapps/project
```

---

## 5. Local Git Remote Configuration for Auto-Deploy

Configure your local repository to push to the deployment remote repository:

```bash
git remote add deployment git@www.huhaoyu.com:/opt/webapps/project-bare.git
git push deployment master
```

Pushing to `deployment` triggers the `post-update` hook, initiating automatic deployment.

---

## Summary

| Step | Purpose                                  |
|-------|-----------------------------------------|
| 1     | Create Git user with restricted shell  |
| 2     | Initialize bare repository              |
| 3     | Configure `post-update` for multi-branch deployment |
| 4     | Set directory ownership and permissions |
| 5     | Push code remotely to trigger deployment |

---

This approach ensures your deployment directory reflects the latest pushed code per branch, handling branch updates and deletions automatically. Modify the deployment steps (`npm install`, build, restart) according to your application's lifecycle.
