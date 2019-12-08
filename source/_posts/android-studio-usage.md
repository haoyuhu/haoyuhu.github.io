---
title: Android Studio应用指南
date: 2016-12-07 16:16:17
toc: true
thumbnail: /2016/12/07/android-studio-usage/0.png
categories:
- 来自新世界
tags:
- Android
- Android Studio
---
## 0、引言
本文转载自[关于Android Studio，你需要知道的9件事](http://www.yiqivr.com/2014/12/you-should-know-the-things-about-android-studio/)。

## 1、如何构建你的项目
点击Build然后选择Make Project，最后点击右下方的Gradle Console查看打印信息。

## 2、Gradle Tasks的使用
点击右侧的`Gradle`，依次展开项目名–>:app，可以查看所有的Gradle任务，比如双击`assembleRelease`，就可以执行此task。双击`assemble`，表示同时执行`assembleDebug`和`assembleRelease`，会在目录`app/build/apk/`生成对应的debug和release的APK。

生成的APK命名规则：**`app-<flavor>-<buildtype>.apk`**; 比如： `app-full-release.apk` 和 `app-demo-debug.apk`.

也可以在左下角点击控制台进行相应的任务命令：比如`输入gradle tasks`命令可以查看所有的task、输入`gradle build`命令表示同时执行`assemble`和`check`；同时命令还支持驼峰匹配：比如`gradle aR`等同于`gradle assembleRelease`。

## 3、运行配置
点击Run选择Edit Configuration,展开Android Application，可以新建一个配置或者编辑一个现有的配置：可以配置是否自动启动默认Activity，启动特定Activity，部署目标是否手动选择，比如可以自动部署到USB（真机）；模拟器网速控制：

网速规则如下所示：

```
None: no latency
GPRS: GPRS (min 150, max 550 milliseconds)
EDGE: EDGE/EGPRS (min 80, max 400 milliseconds)
UMTS: UMTS/3G (min 35, max 200 milliseconds)
```

同时可以配置模拟器启动时的额外命令行：

比如启动适配屏幕：`-scale 96dpi`；还有logcat配置：比如是否每次启动时自动清空。

<!--more-->

## 4、运行
点击Run然后选择Run (或者 Run > debug)

此操作将经历三个主要步骤：编译项目—>创建一个默认运行配置（有则使用—>使用配置安装并运行。

**如果是部署到真机需要注意：**

* 在`build.gradle`文件中配置 <application>标签下：`android:debuggable`为true。（经过测试不配也行）
* 在真机上启用USB debugging：
* 如Android 3.2或更早：`Settings > Applications > Development`
* 4.0或更新：`Settings > Developer options`
* 4.2或更新的版本默认是隐藏的，需要前往 `Settings > About phone`点击Build number7下，返回上一个页面可见。

## 5、使用命令行
* 构建一个debug版本

```
$ chmod +x gradlew（第一次执行需授权命令）
$ ./gradlew assembleDebug
```

构建完成后apk的位置：`app/build/outputs/apk/`。如果为库文件则`lib/build/outputs/libs/`

* 构建一个release版本

```
$ ./gradlew assembleRelease
```

**注意：**此操作完成后还未进行签名，不能安装。接下来可用手动签名和zipalign，也可以利用build script配置自动签名和zipalign。

这里只介绍下**自动签名**：在`build.gradle`中添加s`toreFile, storePassword, keyAlias and keyPassword`相关信息：

也可以在`Project Structure—> Signing`中进行配置，配置成功后会自动在`build.gradle`文件中生成相关信息。

再次`assembleRelease`，成功之后就会生成一个`<your_module_name>-release.apk`，此apk是签名并且zipalign处理过的。

最后使用命令：`adb install <path_to_your_bin>.apk` 就能安装到你的模拟器或者真机啦。

## 6、Gradle Build配置
gradle build配置是使用DSL（特定领域语言）Groovy来配置构建逻辑的。

我们主要是进行配置以下几个方面：

* **Build variants（暂且叫构建变体吧）**：使用此功能不必创建多个项目仅仅使用相同的module就能生成多个不同版本的APK，比如试用版和注册版。
* **Dependencies（依赖关系）**：可以使用本地库或者远程仓库来配置依赖关系。
* **Manifest entries（清单）**：可以生成多个比如不同版本号、项目名称等的APK。
* **Signing（签名）**：允许在构建APK的时候进行签名。
* **ProGuard（混淆）**：配置混淆。
* **Testing（测试）**：不用另外新建测试项目就能进行测试，非常的方便。

## 7、项目project与模块module
两者关系：一个项目有1个或多个模块组成，单个模块由源代码和资源组成，可以独立进行build、Test、debug。

关于模块，主要有以下几种：

* Android应用程序模块Android application modules：主要的模块，可能是mobile, TV, Wear, Glass。
* Android库模块Android library modules：包含一些可重用的源码和资源，构建程序会将之生成AAR (Android Archive)。
* 应用引擎模块App Engine modules：包含APP集成引擎的代码和资源。
* jar包Java library modules：包含一些可重用代码，构建程序将之生成jar包。
* 一个项目有一个项目级别的build.gradle文件，此文件配置所有模块通用的配置，而每个模块都有自己的build.gradle文件来配置特有的设置。

关于这个项目级别的build.gradle：
默认项目会定义Gradle的仓库与依赖关系，支持的仓库包括 JCenter, Maven Central, 或者 Ivy.下面的例子说明了使用JCenter仓库、0.14.4版本的Gradle：

```
buildscript {

    repositories {
        jcenter()
    }
    dependencies {
        classpath ‘com.android.tools.build:gradle:0.14.4′

        // NOTE: Do not place your application dependencies here: they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        jcenter()
    }
}
```
注意：Android的SDK配置在 local.properties的sdk.dir属性中。

**关于各个模块的build.gradle**：

主要会配置以下几个方面：

* android settings：比如编译版本和构建工具版本。
* defaultConfig and productFlavors：清单属性比如applicationId, minSdkVersion, targetSdkVersion等等。
* buildTypes：构建属性比如是否可以debug、是否混淆等。
* dependencies

下面是一个例子：

```
apply plugin:’com.android.application’

android {
    compileSdkVersion 20
    buildToolsVersion “20.0.0″

    defaultConfig {
        applicationId “com.mycompany.myapplication”
        minSdkVersion 13
        targetSdkVersion 20
        versionCode 1
        versionName “1.0″
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile(‘proguard-         android.txt’),’proguard-rules.pro’
        }
        debug {
            debuggable true
        }
    }
}

dependencies {
    compile fileTree(dir:’libs’, include:['*.jar'])
    compile ‘com.android.support:appcompat-v7:20.0.0′
    compile project(path:’:app2, configuration: ‘android-endpoints’)
}
```

## 8、关于dependencies
依赖关系支持三种：**分别是模块依赖、本地二进制依赖、远程二进制依赖**。

远程依赖格式：`group:name:version`，比如：`com.google.guava:guava:16.0.1`。

因此也可以写成`compile group:’com.google.android’,name:’support-v4′,version:’r7′`。
模块依赖格式，比如：

```
MyProject/
+ app/
+ libraries/
+ lib1/
+ lib2/
```
则对应：

```
:app
:libraries:lib1
:libraries:lib2
```

然后在`settings.gradle`文件中则变成了：`include ‘:app’, ‘:libraries:lib1′, ‘:libraries:lib2′`。

## 9、构建变体（build variant）
总的来说：Build Type + Product Flavor = Build Variant

每个生成的APK都是由一种构建变体决定的。一个构建变体由product flavors 和 build types决定；

Product flavors代表一个项目版本，这是你随便定义的，比如区分付费的版本还是免费的版本、是那个CPU类型的版本等等。

下面是一个例子：

```

...

android {

...

    defaultConfig { … }
    signingConfigs { … }
    buildTypes { … }
    productFlavors {
        demo {
            applicationId “com.buildsystemexample.app.demo”
            versionName “1.0-demo”
        }
        full {
            applicationId “com.buildsystemexample.app.full”
            versionName “1.0-full”
        }
    }
}

…
```


这里的applicationId代表不同的包名，因为要生成不同的APP。

Build types就是之前讲的，比如是debug还是release，一个build variant就是两者任意一种的组合。

默认的Android Studio定义了两种build types，没有product flavors。所以只有两种build variants：debug和release。然后构建系统根据每种变体生成对应的APK。

现在比如我们新增两种product flavors：demo和full，就应该有四种build variant：

demoDebug、demoRelease、fullDebug、fullRelease。

如果现在我们再加上一种product flavors：CPU/ABI类型，分别为x86、arm、mips，同理，那么我们就应该有12种build variant。

**Android Studio为了共用代码，变体使用文件夹规则来合并成一种变体**：

关于变体合并优先级从低到高的顺序为：libraries/dependencies -> main src -> productFlavor -> buildType。

**接下来说说源码文件夹的定义规则：**

* src/main/ – the main source directory (默认配置，所有变体通用)
* src/<buildType>/ – the source directory
* src/<productFlavor>/ – the source directory

比如：

```
src/main/ (default configuration)
src/release/ (build type)
src/demo/ (flavor – app type dimension)
src/arm/ (flavor – ABI dimension)
```


在每个源码文件夹里面我们可以使用相同的文件名，但是有个前提，就是这两个文件夹不会组合成一种变体。

构建程序还会将所有的manifests合并成一个manifests，所以最后的manifest定义了不同的components or permissions，manifest合并也有优先级，**优先级从低到高的顺序**为：libraries/dependencies -> main src -> productFlavor -> buildType。

**这儿有个命令规则：**

```
assemble<Variant Name>
assemble<Build Type Name>
assemble<Product Flavor Name>
```

执行上述命令可生成对应的变体APK。

* 比如有两个product flavors：flavor1和flavor2，执行：`assemble Flavor1 Debug`生成对应的APK；
* 给定Build Type执行`assemble Debug`：将生成Flavor1Debug和Flavor2Debug两个变体；
* 给定flavor执行`assemble Flavor1`：生成Flavor1Debug和Flavor1Release两个变体。
