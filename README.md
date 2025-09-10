# GitTaskBench Leaderboard

静态网站（GitHub Pages）用于展示 **GitTaskBench** 评测榜单。外观与交互参考 [FutureX 站点]，实现上采用纯静态 HTML + Tailwind + JS，便于快速部署与维护。

## 目录结构
```
.
├─ index.html                  # 页面
├─ assets/leaderboard.js       # 渲染与排序逻辑
├─ data/
│  ├─ models.json              # 聚合后的榜单数据
│  └─ submissions/             # PR 提交的单条结果（一个提交 = 一个 JSON）
├─ schema/submission.schema.json
└─ .github/workflows/          # 自动化
```

## 提交规范（PR）
- 在 `data/submissions/` 下添加一个 JSON，字段规范见 [`schema/submission.schema.json`](schema/submission.schema.json)。建议字段：
  - `model`：模型或代理名称（必填）
  - `framework`：所用框架（如 OpenHands / SWE-Agent / Aider）
  - `completion`：Execution Completion（0~1，详见基准说明）
  - `pass`：Task Pass（0~1）
  - `alpha`：可选，综合分
  - `cost`：可选，总花费（美元）
  - `iterations`：可选，最大迭代数
  - `domains`：覆盖领域（Image/Video/Speech/Physio/Security/Web/Office）
  - `config_url`：可选，评测配置/报告链接
  - `notes`：备注
- PR 将触发校验与部署：
  1. 校验 JSON 是否符合 schema；
  2. 运行 `scripts/aggregate.py`（内联在 workflow 中）将 `data/submissions/*.json` 聚合为 `data/models.json`；
  3. 部署到 GitHub Pages。

> 指标定义以 GitTaskBench 官方仓库为准：Execution Completion 与 Task Pass【see: README】。

## 本地预览
> 任何静态服务器均可，例如：
```bash
# Python
python -m http.server -d . 8080
# 或者 Node
npx http-server -p 8080
```
访问 http://localhost:8080

## 部署（GitHub Pages）
1. 将本仓库推送到 `your-org/GitTaskBench-Leaderboard`；
2. Settings → Pages：Source 选择 “GitHub Actions”；
3. 合并 PR 后自动更新。

## 版权与引用
- 基准：QuantaAlpha/GitTaskBench
- 参考样式：FutureX
