---
name: design-admin-ui
description: 運用密度の高い admin UI を整理する skill。
---

## Purpose

管理画面を「情報密度の高い作業面」として設計する。

## Use When

- event board
- admin dashboard
- backoffice forms

## Inputs

- operator task
- priority field
- table / form / filter の要件

## Workflow

1. operator が最短で見たい情報を並べる
2. card より table を優先するか判断する
3. status と action を同じ視線上に置く
4. public UI と見た目を混同しない

## Output Contract

- density 方針
- screen sections
- state list

## Guardrails

- marketing 用の空気感を admin に持ち込まない
- table が必要な箇所を card に逃がさない

## Related Skills

- `story-ui-spec`
- `review-performance`
