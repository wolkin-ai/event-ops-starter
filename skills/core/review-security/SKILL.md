---
name: review-security
description: 入力検証とデータ露出の観点でレビューする skill。
---

## Purpose

フォーム、保存、表示の間で危険な抜け漏れを見つける。

## Use When

- user input
- browser storage
- auth 周辺
- 外部 I/O

## Inputs

- 変更対象パス
- 扱うデータ種別
- 想定脅威

## Workflow

1. 入力点を洗い出す
2. validation の有無を確認する
3. 保存先と表示先の露出を確認する
4. severity をつけて整理する

## Output Contract

- threat-aware findings
- severity
- blocking 判定

## Guardrails

- 一般論だけで指摘しない
- 実際のデータ流れに紐づける

## Related Skills

- `review-architecture`
- `investigate-issue`
