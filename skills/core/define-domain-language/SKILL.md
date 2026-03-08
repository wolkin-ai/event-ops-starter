---
name: define-domain-language
description: L1/L2 語彙を整理し glossary と contract card を更新する skill。
---

## Purpose

ビジネス会話とコード上の名前をぶらさない。

## Use When

- 新しい entity や use case を切るとき
- UI 文言と内部名が分かれそうなとき
- contract card を更新するとき

## Inputs

- 対象 slice
- 画面文言
- 想定する entity / value object / use case 名

## Workflow

1. L1 と L2 を切り分ける
2. glossary と contract card を更新する
3. 変えにくい語は L1 として固定する
4. UI copy は L2 として扱う

## Output Contract

- L1 候補
- L2 候補
- glossary 更新案

## Guardrails

- UI ラベルをそのまま domain 型名にしない
- 契約カードなしで L1 を増やさない

## Related Skills

- `story-ui-spec`
- `implement-domain-usecase`
