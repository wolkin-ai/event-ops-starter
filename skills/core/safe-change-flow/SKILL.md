---
name: safe-change-flow
description: 安全な実装手順と検証順序を固定する project-local skill。
---

## Purpose

変更を最小差分で進め、検証ゲートを省略しない。

## Use When

- コード変更
- 設定変更
- Storybook や test の更新

## Inputs

- 目的
- 影響対象
- 完了条件

## Workflow

1. `docs/process/harness-implementation-checklist.md` を開き、今回の変更に関係する section を先に確認する
2. 影響範囲を狭く定義する
3. 変更対象を最小セットに固定する
4. Story / test / implementation を揃える
5. 既定では `npm run verify:all` を使う
6. 個別実行時は `format:check -> db:prepare -> lint -> skills:validate -> cleanup:check -> boundary:check -> arch:check -> typecheck -> test -> build -> build-storybook -> test-storybook -> test:e2e` の順で検証する
7. local Prisma state が壊れている場合だけ `db:reset-local` を明示実行する
8. commit 前に checklist の closeout 項目を見直す

## Output Contract

- 変更内容
- ゲート結果
- 残リスク

## Guardrails

- 破壊的操作を勝手に行わない
- home 配下の skill を参照しない
- Storybook 対象の UI は story を欠かさない
- UI の状態面は `story-ui-spec` と checklist の Storybook-first section を飛ばさない
- domain/application の変更では `implement-domain-usecase` と checklist の TDD / architecture section を飛ばさない
- route や adapter を触る変更では checklist の Error handling / Boundary validation section を飛ばさない

## Related Skills

- `story-ui-spec`
- `implement-domain-usecase`
- `review-architecture`
