---
name: design-public-ui
description: 公開画面の visual direction と情報の見せ方を設計する skill。
---

## Purpose

レビューしやすく、ブランド感のある public UI を作る。

## Use When

- LP
- event list
- event detail
- attendee-facing page

## Inputs

- 対象ユーザー
- 主要 CTA
- レビューしたい状態

## Workflow

1. tone と hierarchy を決める
2. hero / cards / CTA の流れを組む
3. story で主要状態を並べる
4. 文言の可変部分を L2 として分離する

## Output Contract

- visual direction
- component list
- story state list

## Guardrails

- generic SaaS 風の凡庸な layout にしない
- 管理画面のトーンを混ぜない

## Related Skills

- `story-ui-spec`
- `define-domain-language`
