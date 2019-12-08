---
title: Troubleshooting GitHub Pages build failures——解决GitHub Pages部署失败问题
date: 2019-12-08 13:48:56
toc: true
categories: 
- 实践小能手
tags:
- Github
- Github Page
---
If your GitHub Pages site fails to build on our servers, we'll send you an email letting you know about the failure. In most cases, we'll be able to identify the exact file and error so you can fix it and push again.

如果你的GitHub Pages网站无法在服务器上部署，我们讲发送一封邮件给您，让您了解失败的原因。大多数情况下，我们能够找到发生错误的文件以及错误的类型，你可以修复问题并重新推送到GitHub。

## Generic failures--一般故障
These build failures will not produce an email with specific file and error information. If you receive an email that simply says "Page build failed" with no further details, or your GitHub Pages site is not showing up after the first push, check for the following common errors:

这类错误不会在email中显示确切的文件及错误信息。如果你收到的邮件简单地显示“Page build failed”，且没有更多额外信息，或你的GitHub Pages网站在您推送到GitHub后并没有显示，请检查如下几个常见的错误：

### Unverified email address--未认证的email地址
To trigger a build, the user who pushes a commit to the Pages repository must have a verified email address.

After you verify an email address, you'll need to push to the repository again to trigger the build process on our servers. You can also contact GitHub support to manually run a build.

为部署您的个人网页，用户推送的commit必须有一个经认证的email地址。

当email经过认证后，你需要再次向你的远程仓库推送commit以保证服务器为您生成网页。你也可以联系GitHub支持来人工地生成网页。

### Deploy key used for push--推送所需的部署公钥
Pushes must come from a user account with a verified email address. You won't trigger a build if you use a deploy key to push to an organization's Pages repository.

Instead, you can set up a machine user as a member of your organization.

推送必须来自一个经email地址认证的帐户。如果您使用一个部署公钥去推送commit到一个组织的网页仓库，这将不能触发部署动作。

相反的，你能够设置一个machine用户作为你组织的一个成员。

<!--more-->

### Unsupported plugins--不支持的插件
The GitHub Pages server will not build with unsupported plugins. For a list of supported plugins and instructions on how to include them in your GitHub Pages site, see Using Jekyll Plugins with GitHub Pages.

GitHub Pages服务器不能够部署不支持的插件。支持插件列表和集成插件的方法详见[Using Jekyll Plugins with GitHub Pages](https://help.github.com/articles/using-jekyll-plugins-with-github-pages/)。

### Size limits--容量限制
Repositories on GitHub have a soft limit of 1 GB per repository. Similarly, GitHub Pages sites also have a 1 GB soft limit.

If your Pages site exceeds that limit, you may find that your site won't build. You may also receive a polite email from us requesting that you reduce the size of your site.

GtiHub的每个仓库都有1G的容量上限，同样GitHub Pages网站也有1G的上限要求。

如果您的网站超过了这个上限，您的网站将无法部署。您也可能会受到一封邮件提示您减小网站的大小。

## Source setting--Source设置
Our build server overrides the `source` setting when it builds Pages sites. If you change this setting in your \_config.yml file, your GitHub Pages site may not build correctly.

我们的部署服务器在部署网页时会复写`source`设置。如果您修改了\_config.yml文件中的设置，您的GitHub Pages网站可能无法正确部署。

## Working with continuous integration services--持续的继承服务
Some CI services, such as Travis CI, won't build your gh-pages branch unless you explicitly whitelist it. If you want your GitHub Pages site to integrate with a CI service, you'll need to specify the gh-pages branch in your CI's configuration file.

For example, Travis CI's documentation suggests adding the following lines to a .travis.yml file:

```
branches:
  only:
    - gh-pages
```

一些CI服务，如Travis CI，并不会部署您的gh-pages分支，除非您明确地指明这个要求。如果您希望GitHub Pages网站即成CI服务，你需要在CI的设置文件中特别声明gh-pages分支。

比如，Travis CI的文档建议在.travis.yml文件中加上下面的代码：

```
branches:
  only:
    - gh-pages
```