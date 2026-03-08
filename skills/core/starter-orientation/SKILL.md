---
name: starter-orientation
description: この starter の全体像、読む順番、運用導線を短時間で案内する project-local onboarding skill。
---

## Purpose

この repository の構造、正典、運用手順を迷わず説明する。

## Use When

- 新しい人に repo を説明するとき
- 何から読めばよいか分からないとき
- 新しいプロジェクトをこの starter から始めるとき
- docs が増えて追いづらくなったとき

## Inputs

- 相手の立場
- 目的
- 必要な深さ

## Workflow

1. まず相手の目的を `概要理解 / 新規開始 / 日常運用 / platform保守` のどれかに分類する
2. 最初の入口として `docs/process/starter-guide.md` を使う
3. 実務導線が必要なら `docs/process/team-starter-kit.md` を使う
4. 詳細ルールが必要なら `CLAUDE.md` と該当 process doc / ADR に案内する
5. skill 利用案内が必要なら `docs/process/skill-matrix.md` を使う
6. 回答は「今読むべき順番」と「次に開く文書」を短く整理して返す

## Output Contract

- 相手の目的に合った読む順番
- 最初に開く文書
- 次に必要な skill やコマンド

## Guardrails

- `starter-guide.md` を source of truth と誤認しない
- 詳細ルールは必ず `CLAUDE.md` や該当 ADR / process doc に戻す
- 一度に全資料を列挙しすぎない
- home 配下の skill ではなく project-local docs と skills を優先する

## Related Skills

- `safe-change-flow`
- `define-domain-language`
- `story-ui-spec`
