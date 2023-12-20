#!/bin/bash

# 执行脚本a
./script_a.sh

# 检查脚本a的执行状态
if [ $? -eq 0 ]; then
  echo "脚本a执行成功，1秒后执行脚本b"

  # 等待1秒
  sleep 1

  # 执行脚本b
  ./script_b.sh

  # 检查脚本b的执行状态
  if [ $? -eq 0 ]; then
    echo "脚本b执行成功"
  else
    echo "脚本b执行失败"
  fi
else
  echo "脚本a执行失败，不执行脚本b"
fi
