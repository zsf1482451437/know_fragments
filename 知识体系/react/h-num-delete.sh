#!/bin/bash

# 使用for循环处理当前目录下的所有.md文件
for markdown_file in ./*.md
do
  # 使用sed命令删除标题和文字之间的内容
  sed -E -i'' 's/(^#+)\s*[0-9]+(\.[0-9]+)?\s*(.*)$/\1 \3/' "$markdown_file"

  # 输出操作完成的消息
  echo "$markdown_file 标题前的数字已删除！"
done
