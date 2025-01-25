# Daily Hacker News Action

[中文文档](README_zh.md)

A GitHub Action that automatically fetches and transforms daily Hacker News content from [signalkite](https://github.com/anaclumos/signalkite).

## Features

- Automatically fetches Hacker News content from signalkite repository
- Supports multiple languages (en, zh-Hans, etc.)
- Transforms content into a standardized markdown format
- Configurable target directory for output files

## Usage

Add the following workflow to your repository:

```yaml
name: Daily Hacker News

on:
  schedule:
    - cron: "0 0 * * *" # Runs at 00:00 UTC every day
  workflow_dispatch: # Allows manual trigger

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch Daily Hacker News
        uses: zhaochunqi/daily-hacker-news-action@main
        with:
          targetDir: "news" # Optional: specify target directory
          hackerNewsLang: "en" # Optional: specify language (default: en)
```

## Inputs

| Input            | Description                                                 | Required | Default |
| ---------------- | ----------------------------------------------------------- | -------- | ------- |
| `targetDir`      | Target directory to save the transformed markdown file      | No       | `.`     |
| `hackerNewsLang` | Language of the Hacker News content (e.g., 'en', 'zh-Hans') | No       | `en`    |

## License

MIT
