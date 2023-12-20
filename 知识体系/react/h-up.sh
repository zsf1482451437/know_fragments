#!/bin/bash

# 使用for循环处理当前目录下的所有.md文件
for markdown_file in ./*.md
do
  # 使用sed命令升高标题级别
  sed -E -i'' 's/^(#+)\s+(.*)$/#\1 \2/' "$markdown_file"

  # 输出操作完成的消息
  echo "$markdown_file 所有标题已升级！"
done
