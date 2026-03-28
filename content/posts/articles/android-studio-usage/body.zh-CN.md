## 0、引言
本文转载自[关于Android Studio，你需要知道的9件事](http://www.yiqivr.com/2014/12/you-should-know-the-things-about-android-studio/)，聚焦Android Studio早期核心使用知识。

---

## 1、如何构建你的项目
点击菜单：**Build > Make Project**，构建输出可在右下方的**Gradle Console**查看。

---

## 2、Gradle任务的使用
打开右侧的**Gradle**面板，依次展开项目名 -> `:app`，即可查看所有Gradle任务。例如：

- 双击`assembleRelease`生成release版本APK。
- 双击`assemble`同时生成debug和release版本APK，目录位置为`app/build/outputs/apk/`。

**APK命名规则：**

```plaintext
app-<flavor>-<buildtype>.apk
```

示例：`app-full-release.apk`，`app-demo-debug.apk`。

也可在终端执行Gradle命令，如：

```bash
gradle tasks   # 列出所有任务
gradle build   # 同时执行 assemble + check
gradle aR      # 快捷命令，等同于 assembleRelease
```

---

## 3、运行配置
进入**Run > Edit Configurations**，展开**Android Application**。可进行：

- 新建或编辑运行配置
- 配置是否自动启动默认Activity或指定Activity
- 选择部署目标，如自动部署到连接的USB真机

### 模拟器网速配置
| 配置项 | 说明                | 延迟范围 (毫秒)           |
|--------|---------------------|--------------------------|
| None   | 无延迟              | 0                        |
| GPRS   | GPRS网络            | 150 ~ 550                |
| EDGE   | EDGE/EGPRS网络      | 80 ~ 400                 |
| UMTS   | UMTS/3G网络         | 35 ~ 200                 |

可添加额外命令行参数，如：

```bash
-scale 96dpi   # 适配屏幕DPI
```

logcat配置也可设置，比如自动清空日志。

---

## 4、运行项目
点击**Run > Run**（或 Debug），经历流程：编译项目 -> 使用默认或现有配置 -> 安装并运行。

### 真机部署注意
- `AndroidManifest.xml`中`<application>`标签的`android:debuggable`设为`true`（可选，部分版本可不配置）。
- 设备开启USB调试：
  - Android 3.2及以前：`设置 > 应用 > 开发`
  - 4.0及以后：`设置 > 开发者选项`
  - 4.2及以后，开发者选项默认隐藏，需连续点击“版本号”7次激活。

---

## 5、命令行使用
构建Debug版本：

```bash
chmod +x gradlew     # 初次执行授权
./gradlew assembleDebug
```

APK生成路径：`app/build/outputs/apk/`。

构建Release版本：

```bash
./gradlew assembleRelease
```

**注意：**release APK初始未签名，无法直接安装，需要签名和zipalign处理。

### 自动签名配置
在`build.gradle`中添加`storeFile`、`storePassword`、`keyAlias`、`keyPassword`相关信息，或使用**Project Structure > Signing**界面配置，自动生成对应Gradle设置。

重新执行`assembleRelease`会生成签名且zipalign处理的APK。

安装示例：

```bash
adb install <your_apk_path>.apk
```

---

## 6、Gradle构建配置
使用Groovy DSL定义构建逻辑，主要配置内容：

| 配置项         | 功能说明                                               |
|---------------|-------------------------------------------------------|
| 构建变体      | 单个模块生成多个APK版本（如免费版、付费版）            |
| 依赖管理      | 添加本地库、远程仓库依赖                               |
| Manifest条目  | 控制不同版本号、应用名称等清单属性                      |
| 签名          | APK构建时配置签名信息                                 |
| ProGuard      | 混淆与代码优化配置                                     |
| 测试          | 内置支持测试，无需新建项目                             |

---

## 7、项目和模块概述
- 一个项目包含一个或多个模块。
- 模块由代码和资源组成，可以单独构建、测试及调试。

### 常见模块类型
| 类型                   | 说明                         |
|------------------------|------------------------------|
| Android应用模块        | 主模块，包含Phone、TV、Wear等 |
| Android库模块          | 复用源码，产出AAR包           |
| 应用引擎模块           | 集成引擎代码和资源           |
| Java库模块             | 复用代码，产出JAR包           |

### 项目级别`build.gradle`
统一配置仓库与Gradle插件依赖：

```groovy
buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:0.14.4'
        // 应用依赖配置在模块build.gradle中
    }
}
allprojects {
    repositories {
        jcenter()
    }
}
```

SDK路径配置于`local.properties`中的`sdk.dir`。

### 模块级别`build.gradle`
示例配置：

```groovy
apply plugin: 'com.android.application'

android {
    compileSdkVersion 20
    buildToolsVersion '20.0.0'

    defaultConfig {
        applicationId 'com.mycompany.myapplication'
        minSdkVersion 13
        targetSdkVersion 20
        versionCode 1
        versionName '1.0'
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
        debug {
            debuggable true
        }
    }
}

dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    compile 'com.android.support:appcompat-v7:20.0.0'
    compile project(path: ':app2', configuration: 'android-endpoints')
}
```

---

## 8、依赖管理
支持三种依赖类型：模块依赖、本地二进制依赖、远程二进制依赖。

远程依赖格式示例：

```groovy
compile 'com.google.guava:guava:16.0.1'
```
也支持命名参数写法：

```groovy
compile group: 'com.google.android', name: 'support-v4', version: 'r7'
```

模块依赖示例：

项目结构

```
MyProject/
├── app/
└── libraries/
    ├── lib1/
    └── lib2/
```

对应Gradle路径：

```
:app
:libraries:lib1
:libraries:lib2
```

`settings.gradle`配置：

```groovy
include ':app', ':libraries:lib1', ':libraries:lib2'
```

---

## 9、构建变体（Build Variant）
构建变体是 **Build Type** 和 **Product Flavor** 的组合。

| 类型           | 含义                                                  |
|----------------|-------------------------------------------------------|
| Build Types    | 如 debug、release，定义调试、混淆等特性              |
| Product Flavors| 自定义区分版本（试用版、完整版、CPU架构等）           |

默认无Flavor时只有两种变体：debug 和 release。

添加两个Flavor：demo和full，则有四个变体：

demoDebug、demoRelease、fullDebug、fullRelease。

若加上ABI的flavor维度（x86、arm、mips），则变体总数为12种。

### 变体合并优先级（由低到高）

libraries/dependencies → main src → productFlavor → buildType。

### 源码目录规则

| 目录           | 说明                   |
|----------------|------------------------|
| src/main/      | 所有变体通用代码        |
| src/<buildType>/ | 构建类型特定代码        |
| src/<productFlavor>/ | Flavor特定代码      |

示例：

```
src/main/
src/release/
src/demo/
src/arm/
```

同名文件可存在于不同目录，只要不属于同一变体组合。


### Manifest合并同样遵循变体合并优先级。

### 构建命令规则

```bash
assemble<VariantName>       # 例：assembleDemoDebug
assemble<BuildTypeName>     # 例：assembleDebug，构建所有debug变体
assemble<ProductFlavorName> # 例：assembleDemo，构建Demo所有变体
```

如有两个flavor：flavor1和flavor2，命令示例：

- `assembleFlavor1Debug` ：生成Flavor1的Debug版本。
- `assembleDebug` ：生成所有debug版本，如Flavor1Debug和Flavor2Debug。
- `assembleFlavor1` ：生成Flavor1的所有构建类型版本，Debug和Release。

---

**本指南兼顾2014年发布时的Android Studio版本与环境，保持技术细节准确和时代背景的呈现。**
