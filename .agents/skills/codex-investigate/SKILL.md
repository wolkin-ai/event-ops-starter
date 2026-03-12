---
name: codex-investigate
description: 不具合調査を構造化する skill。
---

## Purpose

この adapter は Codex 系エージェントから project-local skill を呼ぶための入口です。

## Use When

- `codex-investigate` が指定されたとき
- project-local skill を Codex adapter から解決したいとき

## Inputs

- 対象タスク
- 必要なら対象ファイルや slice

## Workflow

1. 正本の `investigate-issue` を参照する
2. project-local の手順だけを使う
3. ホーム配下の skill には依存しない

Canonical skill: `../../../skills/core/investigate-issue/SKILL.md`

## Output Contract

- 正本 skill の output contract に従う

## Guardrails

- adapter 自体を source of truth にしない
- 絶対パスや home 配下への依存を書かない

## Related Skills

- `investigate-issue`
