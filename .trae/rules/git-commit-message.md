---
alwaysApply: false
description: 
scene: git_message
---
生成 git 提交信息时，使用中文单句，不换行，不添加额外说明。
提交格式为：`type: 简短中文描述`。
`type` 参考常见 GitHub/Conventional Commits 标准，仅使用：`feat`、`fix`、`docs`、`refactor`、`test`、`chore`、`style`、`perf`、`build`、`ci`、`revert`。
描述部分控制在 8 到 20 个中文字符，直接说明本次改动结果，不写背景、不写原因、不加句号。
