import {getInput, info, setFailed} from '@actions/core';
import axios, { AxiosError } from 'axios';
import * as fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';

// 常量配置
const CONFIG = {
  DEFAULT_TARGET_DIR: '.',
  DEFAULT_LANG: 'en',
  GITHUB_RAW_BASE_URL: 'https://raw.githubusercontent.com/anaclumos/signalkite/refs/heads/main',
} as const;

interface DateInfo {
  year: string;
  month: string;
  day: string;
}

// 获取昨天的日期信息
function getYesterdayDate(): DateInfo {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return {
    year: yesterday.getFullYear().toString(),
    month: String(yesterday.getMonth() + 1).padStart(2, '0'),
    day: String(yesterday.getDate()).padStart(2, '0'),
  };
}

// 构建源文件URL
function buildSourceUrl(lang: string, dateInfo: DateInfo): string {
  const { year, month, day } = dateInfo;
  const basePath = CONFIG.GITHUB_RAW_BASE_URL;

  return lang === 'en'
    ? `${basePath}/docs/${year}/${month}/${day}.md`
    : `${basePath}/i18n/${lang}/docusaurus-plugin-content-docs/current/${year}/${month}/${day}.md`;
}

// 转换内容格式
function transformContent(content: string): string {
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '').trim();
  const lines = contentWithoutFrontmatter.split('\n');
  const transformedLines: string[] = [];

  // 添加头部信息
  transformedLines.push('type:: [[Hacker News Daily]]');
  transformedLines.push('tags:: Hacker News');
  transformedLines.push('');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (
      trimmedLine.startsWith('<head>') ||
      trimmedLine.startsWith('</head>') ||
      trimmedLine.startsWith('<meta') ||
      (trimmedLine.startsWith('#') && !trimmedLine.startsWith('##'))
    ) {
      continue;
    }

    if (trimmedLine.startsWith('## ')) {
      transformedLines.push(`- ${trimmedLine}`);
    } else if (trimmedLine.startsWith('### ')) {
      transformedLines.push(`\t- ${trimmedLine}`);
    } else {
      const cleanedLine = trimmedLine.replace(/^"(.*)"$/, '$1');
      const prevLine = transformedLines[transformedLines.length - 1] || '';
      const indent = prevLine.startsWith('\t- ###') ? '\t\t' : '\t';
      transformedLines.push(`${indent}- ${cleanedLine}`);
    }
  }

  return transformedLines.join('\n');
}

// 确保目标目录存在
async function ensureDirectoryExists(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function run(): Promise<void> {
  try {
    const targetDir = getInput('targetDir', { required: false }) || CONFIG.DEFAULT_TARGET_DIR;
    const lang = getInput('hackerNewsLang', { required: false }) || CONFIG.DEFAULT_LANG;
    
    const dateInfo = getYesterdayDate();
    const sourceUrl = buildSourceUrl(lang, dateInfo);
    
    try {
      const response = await axios.get(sourceUrl);
      const transformedContent = transformContent(response.data);
      
      await ensureDirectoryExists(targetDir);
      
      const outputPath = path.join(
        targetDir,
        `hacker_news_daily___${dateInfo.year}-${dateInfo.month}-${dateInfo.day}.md`
      );
      
      await fs.writeFile(outputPath, transformedContent, 'utf-8');
      info(`Successfully created file at ${outputPath}`);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(`Failed to fetch content: ${axiosError.message}`);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    } else {
      setFailed('An unknown error occurred');
    }
  }
}

run();
