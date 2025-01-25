import * as core from "@actions/core";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

interface HackerNewsContent {
  content: string;
  date: string;
}

async function run(): Promise<void> {
  try {
    // 获取目标目录
    const targetDir = core.getInput("targetDir", { required: false }) || ".";

    // 获取语言设置
    const lang = core.getInput("hackerNewsLang", { required: false }) || "en";

    // 获取当前日期
    const today = new Date();

    // 获取昨天的日期
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // 从昨天的日期中获取年月日
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");

    // 构建URL
    let url = "";
    if (lang === "en") {
      url = `https://raw.githubusercontent.com/anaclumos/signalkite/refs/heads/main/docs/${year}/${month}/${day}.md`;
    } else {
      url = `https://raw.githubusercontent.com/anaclumos/signalkite/refs/heads/main/i18n/${lang}/docusaurus-plugin-content-docs/current/${year}/${month}/${day}.md`;
    }

    // 获取内容
    const response = await axios.get(url);
    const content = response.data;

    // 转换内容格式
    const transformedContent = transformContent(
      content,
      `${year}-${month}-${day}`
    );

    // 确保目标目录存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // 写入文件
    const outputPath = path.join(
      targetDir,
      `hacker_news_daily___${year}-${month}-${day}.md`
    );
    fs.writeFileSync(outputPath, transformedContent);

    core.info(`Successfully created file at ${outputPath}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

function transformContent(content: string, date: string): string {
  // 移除原始 frontmatter
  const contentWithoutFrontmatter = content
    .replace(/^---[\s\S]*?---/, "")
    .trim();

  // 将内容按行分割
  const lines = contentWithoutFrontmatter.split("\n");
  const transformedLines = [];

  // 添加头部信息
  transformedLines.push("type:: [[Hacker News Daily]]");
  transformedLines.push("tags:: Hacker News");
  transformedLines.push("");

  // 处理每一行，转换为大纲格式
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (
      line.startsWith("<head>") ||
      line.startsWith("</head>") ||
      line.startsWith("<meta")
    ) {
      // 跳过HTML标签
      continue;
    } else if (line.startsWith("## ")) {
      // 二级标题转换为一级列表项
      transformedLines.push(`- ${line}`);
    } else if (line.startsWith("### ")) {
      // 三级标题转换为二级列表项
      transformedLines.push(`    - ${line.substring(4)}`);
    } else if (!line.startsWith("#")) {
      // 普通文本作为最后一级列表项
      transformedLines.push(`        - ${line}`);
    }
  }

  // 合并所有行并返回
  return transformedLines.join("\n");
}

run();
