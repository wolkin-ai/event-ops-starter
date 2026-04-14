---
name: implement-domain-usecase
description: domain/application をテスト先行で組み立てる skill。
---

## Purpose

UI から切り離して、domain と use case を堅くする。

## Use When

- entity / value object / use case 実装
- validation 実装
- adapter 追加前のロジック実装

## Inputs

- contract card
- glossary
- 期待する入出力

## Workflow

1. `docs/process/harness-implementation-checklist.md` の Architecture and dependency direction / TDD and use case design section を確認する
2. invariant を列挙する
3. use case test を先に書く
4. port 経由で実装する
5. composition root から接続する

## Output Contract

- tests
- use case
- port と adapter の接続点

## Guardrails

- page component に validation を置かない
- infrastructure detail を application に漏らさない
- domain/application で HTTP status や response payload を組み立てない

## Related Skills

- `define-domain-language`
- `review-architecture`
