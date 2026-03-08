---
name: review-performance
description: rendering と data flow の無駄をレビューする skill。
---

## Purpose

不要な client work と過剰な hydration を減らす。

## Use When

- 新しい page
- 大きい list
- 状態管理の追加

## Inputs

- 変更対象パス
- rendering surface
- 主要な interaction

## Workflow

1. server / client の境界を確認する
2. list と state の大きさを見る
3. static 化できる部分を探す
4. concrete finding に落とす

## Output Contract

- performance findings
- budget risk
- blocking 判定

## Guardrails

- 微差を大げさに扱わない
- 再現性のない所見を blocking にしない

## Related Skills

- `design-admin-ui`
- `review-architecture`
