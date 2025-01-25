# Daily Hacker News Action

这是一个用于获取和转换每日 Hacker News 内容的 GitHub Action，数据来源于 [signalkite](https://github.com/anaclumos/signalkite)。

## 特性

- 自动从 signalkite 仓库获取 Hacker News 内容
- 支持多种语言（如英文、简体中文等）
- 将内容转换为标准化的 markdown 格式
- 可配置输出文件的目标目录

## 使用方法

在你的仓库中添加以下工作流：

```yaml
name: Daily Hacker News

on:
  schedule:
    - cron: "0 0 * * *" # 每天 UTC 00:00 运行
  workflow_dispatch: # 允许手动触发

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch Daily Hacker News
        uses: zhaochunqi/daily-hacker-news-action@main
        with:
          targetDir: "news" # 可选：指定目标目录
          hackerNewsLang: "en" # 可选：指定语言（默认：en）
```

## 配置参数

| 参数             | 描述                                            | 必需 | 默认值 |
| ---------------- | ----------------------------------------------- | ---- | ------ |
| `targetDir`      | 保存转换后的 markdown 文件的目标目录            | 否   | `.`    |
| `hackerNewsLang` | Hacker News 内容的语言（例如：'en'、'zh-Hans'） | 否   | `en`   |

## 本地开发和测试

### 1. 安装依赖

```bash
pnpm install
```

### 2. 编译和打包

```bash
pnpm run all
```

这个命令会执行以下操作：

- 使用 TypeScript 编译源代码
- 使用@vercel/ncc 打包所有依赖

### 3. 本地测试

创建一个测试目录并运行打包后的代码：

```bash
# 创建测试目录
mkdir -p page

# 设置必要的环境变量
export INPUT_TARGETDIR="./page"
export INPUT_HACKERNEWSLANG="zh-Hans"  # 可选，默认为"en"

# 运行打包后的代码
node dist/index.js
```

成功运行后，你可以在 test-output 目录中找到生成的 Markdown 文件，文件名格式为`hacker_news_daily___YYYY-MM-DD.md`。

## 环境变量说明

- `INPUT_TARGET_DIR`: 输出目录路径（必需），默认为"./page"
- `HACKER_NEWS_LANG`: 内容语言，默认为"en"（可选）。支持的语言可以在[这里](https://github.com/anaclumos/signalkite/tree/main/i18n)查看，包括：
  - zh-Hans（简体中文）
  - da（丹麦语）
  - ko（韩语）
  - ja（日语）
    等多种语言

## 许可证

MIT
