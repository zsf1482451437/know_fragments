# Info Hub TODO

## 已完成

- [x] 接入飞书机器人 notifier，把 `ConsoleNotifier` 扩展成 `FeishuNotifier`
- [x] 增加 cron 或常驻 scheduler，实现每天早上和每周自动推送
- [x] 支持 `FEISHU_KEYWORD`，自动为飞书推送注入关键词前缀
- [x] 增强 GitHub 日报内容，增加“做什么 / 适用场景 / 指标”三段式信息
- [x] 引入 AI 摘要增强，可选接入 OpenAI 兼容模型生成更自然的中文项目解读

## 下一步建议

- [ ] 配置真实 AI 模型参数并完成联调，验证日报在开启 `AI_SUMMARY_ENABLED=true` 后输出更自然的中文解读
- [ ] 配置真实 `FEISHU_KEYWORD` 并完成飞书 webhook 联调，再补充 `pm2` 常驻部署配置，保证定时任务可稳定运行

## 后续待办

- [ ] 增加多平台 adapter：Hacker News、Product Hunt、Reddit、掘金等
