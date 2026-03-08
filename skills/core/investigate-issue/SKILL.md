---
name: investigate-issue
description: 不具合や違和感を仮説ベースで切り分ける skill。
---

## Purpose

問題の再現面と最小修正面を早く特定する。

## Use When

- bug report
- flaky test
- build / lint failure

## Inputs

- 症状
- 再現手順
- 関連ファイル

## Workflow

1. 症状を 1 文で言い換える
2. 最小再現面を切る
3. 根本原因の仮説を 2 つまで立てる
4. 次に見るべき点を絞る

## Output Contract

- hypothesis
- evidence
- next action

## Guardrails

- 可能性を無限に列挙しない
- 観測できていないことを断定しない

## Related Skills

- `review-security`
- `safe-change-flow`
