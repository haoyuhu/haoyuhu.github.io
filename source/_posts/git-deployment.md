---
title: 利用Git进行自动化多分支部署
date: 2020-03-13 14:52:06
toc: true
categories:
- 实践小能手
tags:
- Git
- 自动化部署
---
# 创建Git用户用于自动部署

## 新建用户

`useradd git`

## 设置密码

`passwd git`

## 配置无法shell登录

```
vi /etc/passwd
git:x:1000:1000::/home/git:/usr/bin/git-shell
```

# 云端自动部署配置

## 新建裸仓库

```
git init --bare /opt/webapps/project-bare.git
cd /opt/webapps/project-bare.git/hooks
cp post-update.sample post-update
vi post-update
```

## 多分支部署

```
#!/bin/sh

unset GIT_DIR
mkdir -p /opt/webapps/project
cd /opt/webapps/project || exit

# 获取当前分支和目标分支
CURR_BRANCH=$(git symbolic-ref --short -q HEAD)
echo "current branch: ${CURR_BRANCH}"
TARGET_BRANCH=$(echo "$1" | awk -F/ '{print $3}')
echo "target branch: ${TARGET_BRANCH}"

# 初始化仓库
git init
git remote add origin /opt/webapps/project-bare.git
# 清除未跟踪或未暂存的代码
git reset --hard
git clean -df

# 拉取远端所有分支最新代码
git fetch origin
# 如果是删除分支操作，则切到master分支并删除该分支，要求不能删除远端master分支
if [ ! -f "/opt/webapps/project-bare.git/refs/heads/${TARGET_BRANCH}" ]
then
    echo "target branch ${TARGET_BRANCH} has been deleted"
    # 如果是当前分支，需要切换到master分支
    if [ "${TARGET_BRANCH}" = "${CURR_BRANCH}" ]
    then
        git checkout master
    fi
    # 删除本地同名分支
    git branch -D "${TARGET_BRANCH}"
else
    if [ "${TARGET_BRANCH}" = "${CURR_BRANCH}" ]
    then
        echo "same branch! rebase origin/${TARGET_BRANCH}."
        git rebase origin/"${TARGET_BRANCH}"
    else
        echo "different branch! checkout to ${TARGET_BRANCH}."
        git branch -D "${TARGET_BRANCH}"
        git checkout -b "${TARGET_BRANCH}" origin/"${TARGET_BRANCH}"
    fi
fi

echo "pull done"

# 业务服务启动逻辑
npm install

rm -rf dist
npm run build

pm2 restart project
echo "deployment done"
```

## 设置权限

```
chown -R git.git /opt/webapps/project-bare.git
```

## 新建代码仓库目录

```
mkdir /opt/webapps/project
chown -R git.git /opt/webapps/project
```

# 本地设置自动部署

```
git remote add deployment git@www.huhaoyu.com:/opt/webapps/project-bare.git
git push deployment master
```

