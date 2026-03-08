---
name: onboarding-guide
description: repo の全体像、読む順番、運用導線を案内する onboarding skill。
---

## Purpose

この adapter は Claude 系エージェントから project-local skill を呼ぶための入口です。

## Use When

- `onboarding-guide` が指定されたとき
- project-local skill を Claude adapter から解決したいとき

## Inputs

- 対象タスク
- 必要なら対象ファイルや slice

## Workflow

1. 正本の `starter-orientation` を参照する
2. project-local の手順だけを使う
3. ホーム配下の skill には依存しない

Canonical skill: `../../../skills/core/starter-orientation/SKILL.md`

## Output Contract

- 正本 skill の output contract に従う

## Guardrails

- adapter 自体を source of truth にしない
- 絶対パスや home 配下への依存を書かない

## Related Skills

- `starter-orientation`
