#!/bin/bash

# 顶级标题级数，如果没有传入参数，则默认为2
TOP_LEVEL=${1:-2}

# 读取树形内容的文本文件
while IFS= read -r line
do
  # 计算标题级数
  level=$(echo "$line" | sed -E 's/[^│]*//g' | wc -m)
  level=$((level + TOP_LEVEL))

  # 生成Markdown标题
  title=$(echo "$line" | sed -E 's/.*├── //;s/.*└── //')
  markdown=$(printf "%${level}s" | tr ' ' '#')
  markdown="$markdown $title"

  # 输出Markdown标题
  echo "$markdown"
done < tree.txt > title.txt

# 显示提示
echo "生成成功~"