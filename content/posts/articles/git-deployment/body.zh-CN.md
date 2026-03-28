## 概述

通过Git推送触发自动部署，大幅简化多分支开发中的持续集成流程。本文介绍了利用Linux服务器上的Git裸仓库和钩子脚本，实现多分支自动化部署的简洁方案。

---

## 1. 创建专用Git用户

出于安全和隔离考虑，创建一个仅限Git操作的系统用户：

```bash
useradd git
passwd git
# 修改登录Shell为git-shell，防止普通登录
vi /etc/passwd
# 将git用户的shell改为：
git:x:1000:1000::/home/git:/usr/bin/git-shell
```

这样可禁止该用户登录服务器，只能执行Git命令。

---

## 2. 在服务器初始化裸仓库

裸仓库作为中央代码库接收所有推送。使用如下命令创建：

```bash
git init --bare /opt/webapps/project-bare.git
cd /opt/webapps/project-bare.git/hooks
cp post-update.sample post-update
vi post-update
```

---

## 3. 编写支持多分支的`post-update`钩子脚本

`post-update`在每次推送后触发，用于更新工作区对应分支代码。以下为优化后的脚本内容：

```sh
#!/bin/sh

unset GIT_DIR
WORK_DIR="/opt/webapps/project"
mkdir -p ${WORK_DIR}
cd ${WORK_DIR} || exit 1

# 获取当前分支与推送目标分支
CURR_BRANCH=$(git symbolic-ref --short -q HEAD)
TARGET_REF="$1"
TARGET_BRANCH=$(echo "${TARGET_REF}" | awk -F/ '{print $3}')

echo "当前分支: ${CURR_BRANCH}"
echo "目标分支: ${TARGET_BRANCH}"

# 若未初始化仓库则初始化
if [ ! -d .git ]; then
  git init
  git remote add origin /opt/webapps/project-bare.git
fi

# 重置工作区，清理未跟踪文件
 git reset --hard
 git clean -df

# 拉取裸仓库所有分支最新代码
 git fetch origin

# 处理分支删除情形
if [ ! -f "/opt/webapps/project-bare.git/refs/heads/${TARGET_BRANCH}" ]; then
  echo "远程分支 ${TARGET_BRANCH} 已删除。"
  if [ "${TARGET_BRANCH}" = "${CURR_BRANCH}" ]; then
    git checkout master
  fi
  git branch -D "${TARGET_BRANCH}" > /dev/null 2>&1 || true
else
  if [ "${TARGET_BRANCH}" = "${CURR_BRANCH}" ]; then
    echo "当前分支更新，执行rebase。"
    git rebase origin/${TARGET_BRANCH}
  else
    echo "切换至分支 ${TARGET_BRANCH}"
    git branch -D "${TARGET_BRANCH}" > /dev/null 2>&1 || true
    git checkout -b "${TARGET_BRANCH}" origin/${TARGET_BRANCH}
  fi
fi

echo "代码更新完成。"

# 业务部署流程（根据项目实际调整）
npm install
rm -rf dist
npm run build
pm2 restart project

echo "部署成功完成。"
```

---

## 4. 配置权限

确保Git用户拥有仓库及工作目录权限：

```bash
chown -R git:git /opt/webapps/project-bare.git
mkdir -p /opt/webapps/project
chown -R git:git /opt/webapps/project
```

---

## 5. 本地仓库配置自动部署远程

加入远程仓库，推送代码触发自动部署：

```bash
git remote add deployment git@www.huhaoyu.com:/opt/webapps/project-bare.git
git push deployment master
```

推送到`deployment`远程时即执行服务器端`post-update`钩子。

---

## 总结

| 步骤 | 目的                               |
|------|----------------------------------|
| 1    | 创建受限Shell的Git用户           |
| 2    | 初始化裸仓库                     |
| 3    | 配置支持多分支的`post-update`脚本 |
| 4    | 设置仓库及工作目录权限           |
| 5    | 本地配置远程推送实现自动部署     |

---

该方案确保部署目录实时更新对应分支代码，并自动处理分支新增、更新与删除。根据项目实际需求调整部署命令，实现高效自动化分支管理与发布。
