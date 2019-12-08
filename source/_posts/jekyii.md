---
title: Using Jekyll with Pages——使用Jekyll框架
date: 2016-12-08 13:48:44
toc: true
categories: 
- 实践小能手
tags:
- JekyII
---
In addition to supporting regular HTML content, GitHub Pages support Jekyll, a simple, blog-aware static site generator. Jekyll makes it easy to create site-wide headers and footers without having to copy them across every page. It also offers some other advanced templating features.

为了支持HTML内容，GitHub Pages支持了Jekyll框架，Jekyll是一个简单的博客类静态网站生成器。Jekyll能够简单地在各个页面中使用全局的headers和footers。同时Jekyll也能提供一些其他的模版特性。

## Using Jekyll——使用Jekyll
Every GitHub Page is run through Jekyll when you push content to a specially named branch within your repository. For User Pages, use the `master` branch in your `username.github.io` repository. For Project Pages, use the `gh-pages` branch in your project's repository. Because a normal HTML site is also a valid Jekyll site, you don't have to do anything special to keep your standard HTML files unchanged. Jekyll has thorough documentation that covers its features and usage. Simply start committing Jekyll formatted files and you'll be using Jekyll in no time.

当你向一个特殊命名的远程仓库推送内容后，GitHub Page就能够通过Jekyll来运行。对于用户页面，可以在名为`username.github.io`的仓库中设置`master`分支。对于项目页面，在项目仓库中设置`gh-pages`分支。因为一个普通的HTML网页也是一个Jekyll框架网页，所以你无需对你的标准HTML文件做任何改动。[Jekyll有专门描述其特性和使用方法的文档](http://jekyllrb.com/docs/home/)。你可以轻轻松松使用Jekyll框架来实现你的网站。

## Installing Jekyll——安装Jekyll
We highly recommend installing Jekyll on your computer to preview your site and help diagnose troubled builds before publishing your site on GitHub Pages.

Luckily, installing Jekyll on your computer, and ensuring your computer most closely matches the GitHub Pages settings is easy, thanks to the GitHub Pages Gem and our dependency versions page. To install Jekyll, you'll need a few things:

我们强烈推荐你在你的电脑上安装Jekyll来预览你的网站，同时这也能帮助你在GitHub Pages上发布网站之前，诊断因为部署失败而引发的错误。非常幸运地，在电脑上安装Jekyll和相关设置非常的简单易懂。安装Jekyll的步骤如下：

<!--more-->

* Ruby - Jekyll requires the Ruby language. If you have a Mac, you've most likely already got Ruby. If you open up the Terminal application, and run the command `ruby --version` you can confirm this. Your Ruby version should begin with 1.9.3 or 2.0.0. If you've got that, you're all set. Skip to step #2. Otherwise, follow these instructions to install Ruby.

* Bundler - Bundler is a package manager that makes versioning Ruby software like Jekyll a lot easier if you're going to be building GitHub Pages sites locally. If you don't already have Bundler installed, you can install it by running the command `gem install bundler`.

* Jekyll - The main event. You'll want to create a file in your site's repository called `Gemfile` and add the line `gem 'github-pages'`. After that, simply run the command, `bundle install` and you're good to go. If you decided to skip step #2, you can still install Jekyll with the command `gem install github-pages`, but you may run into trouble down the line. Here’s an example of a Gemfile you can use (placed in the root directory of your repository):

```bash
source 'https://rubygems.org'
gem 'github-pages'
```

* Ruby: Jekyll要求电脑上已经安装了Ruby语言。如果你使用的是Mac，那么你的电脑中已经预装了Ruby。你可以打开终端输入`ruby --version`来查看Ruby的版本信息。Ruby的版本号必须介于1.9.3到2.0.0之间。如果你已经确认这些信息都是正确的，那么第一步就已经完成了，接下来可以执行第二步。否则，按要求[安装Ruby](https://www.ruby-lang.org/en/downloads/)。

* Bundler: Bundler是一个Ruby应用的包管理软件。如果你没有安装Bundler，请在命令行中输入`gem install bundler`。

* Jekyll: 在你的网站仓库的根目录下创建一个名为`Gemfile`的文件，在文件中写下`gem 'github-pages'`。然后，在命令行中输入`bundle install`就会安装Jekyll和所有相关的依赖包。如果你跳过了第二步，你仍能够安装Jekyll，在命令行中输入`gem install github-pages`，但你可能会遇到一些问题，此时你要修改`Gemfile`文件。如下：

```bash
source 'https://rubygems.org'
gem 'github-pages'
```

## Running Jekyll——运行Jekyll
To run Jekyll in a way that matches the GitHub Pages build server, run Jekyll with Bundler. Use the command `bundle exec jekyll serve` in the root of your repository (after switching to the `gh-pages` branch for project repositories), and your site should be available at` http://localhost:4000`. For a full list of Jekyll commands, see the Jekyll documentation.

为了模拟GitHub Pages使用Jekyll部署服务器的过程，我们使用Bundler运行Jekyll。具体操作：在**网页仓库根目录**下命令行输入`bundle exec jekyll serve`（如果是项目仓库，需要切换到`gh-pages`分支）。然后你就可以在浏览器中访问`http://localhost:4000`来看到你在本地生成的网页。所有的Jekyll命令请见[Jekyll文档](http://jekyllrb.com/docs/usage/)。

## Keeping Jekyll up to date——更新Jekyll
Jekyll is an active open source project, and is updated frequently. As the GitHub Pages server is updated, the software on your computer may become out of date, resulting in your site appearing different locally from how it looks when published on GitHub. To keep Jekyll up to date, you can run the command `bundle update` (or if you opted out of step 2, run `gem update github-pages`).

Jekyll是一个非常活跃的开源项目，它更新得非常频繁。当GitHub Pages服务器更新后，你电脑上的Jekyll可能就过时了，这会导致你的网站在GitHub上显示的模样和在本地模拟的模样不同。所以，请保证你的Jekyll是最新版本，你可以在命令行中输入`bundle update`来更新Jekyll（如果你跳过了安装的第二步，请输入`gem update github-pages`）。

## Configuring Jekyll——配置Jekyll
You can configure most Jekyll settings by creating a `_config.yml` file.

你可以通过创建和修改`_config.yml`文件来完成大部分的Jekyll设置。

### Defaults——默认设置

The following defaults are set by GitHub, which you are free to override in your `_config.yml` file:

下面`_config.yml`文件中的默认设置是来自GitHub的，你可以自由地修改。

```
highlighter: pygments
github: [Repository metadata]
```

For the content of the repository metadata object, see [repository metadata on GitHub Pages](https://help.github.com/articles/repository-metadata-on-github-pages/).

仓库内的元数据内容请见[repository metadata on GitHub Pages](https://help.github.com/articles/repository-metadata-on-github-pages/)。

### Configuration Overrides

We override the following `_config.yml` values, which you are unable to configure:

我们可以修改`_config.yml`文件中的值（一般不需要修改）：

```
safe: true
lsi: false
source: your top-level directory
```

Keep in mind that if you change the `source` setting, your pages may not build correctly. GitHub Pages only considers `source` files in the top-level directory of a repository.

如果你更改了`source`设置，你的页面可能会部署失败。GitHub Pages只会考虑仓库中顶级目录下的`source`文件。

## Frontmatter is required——格式
Jekyll requires that Markdown files have front-matter defined at the top of every file. Front-matter is just a set of metadata, delineated by three dashes:

Jekyll要求每一个Markdown文件在头部进行定义，主要是设置元数据。通过`---`与正文分隔。

```
---
title: This is my title
layout: post
---

Here is my page.
```

If you like, you can choose to omit front-matter from your file, but you'll still need to make the triple-dashes:

你可以省略你的头部定义，但你仍需要`---`来分隔。

```
---
---

Here is my page.
```

If your file is within the _posts directory, you can omit the dashes entirely.

For more information, check out the Jekyll docs.

如果你的文件在`_posts`目录下，你能够省略`---`。更多的信息请[见Jekyll文档](http://jekyllrb.com/docs/frontmatter/)。

### Troubleshooting——解决问题
If your Jekyll site is not rendering properly after you push it to GitHub, it's useful to run Jekyll locally so you can see any parsing errors. In order to do this, you'll want to use the same versions of Jekyll and other dependencies that we use.

如果你推送commit到GitHub后，你的Jekyll网站没有正常显示，那么你可以在本地运行Jekyll来找到错误的原因。但前提是，你必须使用与GitHub Pages相同的[Jekyll和依赖包版本](https://pages.github.com/versions/)。

To ensure your local development environment is using the same version of Jekyll and its dependencies as GitHub Pages, you can periodically run the command `gem update github-pages` (or `bundle update github-pages` if using Bundler) once Jekyll is installed. For more information, see the GitHub Pages Gem repository.

为保证你的本地开发环境所使用的Jekyll和依赖包与GitHub Pages相同，你可以定期地在命令行中`输入gem update github-pages`（如果安装了Bundler，输入`bundle update github-pages`）。更多信息详见[GitHub Pages Gem repository](https://github.com/github/pages-gem)。

If your page isn't building after you push to GitHub, see "Troubleshooting GitHub Pages build failures".

如果你的网页不能正常显示。请见["Troubleshooting GitHub Pages build failures"](https://help.github.com/articles/troubleshooting-github-pages-build-failures/)。

If you are having issues with your Jekyll Pages, make sure you are not using categories that are named the same as another project, as this could cause path conflicts. For example: if you have a blog post named 'resume' in your User Page repository and a project named 'resume' with a `gh-pages` branch, they will conflict with each other.

如果你的Jekyll页面有问题，请确保没有重名的情况发生，否则会造成路径冲突。例如：在你的个人用户网站仓库中有一篇名为‘resume’的博文，同时恰好又有一个名为‘resume’的项目下有`gh-pages`分支。

## Turning Jekyll off——关闭Jekyll
You can completely opt out of Jekyll processing by creating a file named `.nojekyll` in the root of your Page repository and pushing that file to GitHub. This should only be necessary if your site uses directories that begin with an underscore, as Jekyll sees these as special directories and does not copy them to the final destination.

如果你不想使用这个Jekyll页面，你可以在你的个人用户页面仓库的根目录下创建一个名为`.nojekyll`的文件，同时将这个改动推送到远程仓库。那么就可以隐藏这个网站了。

## Contributing——贡献
If there's a feature you wish that Jekyll had, feel free to fork it and send a pull request. We're happy to accept user contributions.

如果你希望Jekyll有一些其他特性，请[fork](https://github.com/jekyll/jekyll)后pull request你的改动。我们很高兴能接受用户的贡献。