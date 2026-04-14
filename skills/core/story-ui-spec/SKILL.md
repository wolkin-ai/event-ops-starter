---
name: story-ui-spec
description: Storybook を入口に slice を設計し、状態面を明確化する skill。
---

## Purpose

実装前に UI 状態と review surface を固定する。

## Use When

- 新しい story を書くとき
- UI 状態をレビューしたいとき
- slice を切り出すとき

## Inputs

- 対象画面
- 状態一覧
- L1 / L2 候補

## Workflow

1. `docs/process/harness-implementation-checklist.md` の Storybook-first UI section を確認する
2. story の目的を 1 文で書く
3. default / error / success を揃える
4. play 関数で主要操作を 1 件以上検証する
5. contract card と接続する

## Output Contract

- story 一覧
- 状態一覧
- play の観点

## Guardrails

- story を screenshot 置き場にしない
- state 名に曖昧語を使わない

## Related Skills

- `design-public-ui`
- `design-admin-ui`
- `define-domain-language`
