---
name: review-architecture
description: 依存方向と構造整合性をレビューする skill。
---

## Purpose

layering と naming の破綻を早期に止める。

## Use When

- 構造変更
- 新しい composition root
- import 境界の見直し

## Inputs

- 変更対象パス
- contract card
- glossary 差分

## Workflow

1. dependency direction を確認する
2. UI から infrastructure 直参照がないか見る
3. glossary / contract card と型名を照合する
4. blocking finding を切り出す

## Output Contract

- severity 付き findings
- blocking 判定

## Guardrails

- 感想で終わらせない
- file reference のない所見を出さない

## Related Skills

- `implement-domain-usecase`
- `review-security`
