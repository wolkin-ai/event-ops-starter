# Harness Implementation Checklist

Use this checklist for every code, config, UI, Storybook, adapter, or workflow change.

AI agents should read it before editing and use it again before commit. Humans should do the same during review.

## Source rules

- [ ] `CLAUDE.md` の workflow と guardrails を確認した
- [ ] [ADR-003](../adr/ADR-003-architecture.md) の依存方向を前提にした
- [ ] 変更が UI / domain / application / infrastructure のどこに属するか先に決めた
- [ ] 必要なら contract card / glossary / process doc の更新対象を洗い出した
- [ ] hosted provider / deployment continuity に触れる変更なら [infrastructure-continuity.md](./infrastructure-continuity.md) と [local-provider-checks.md](./local-provider-checks.md) を確認した

## Before you start

- [ ] `AGENTS.md` と `CLAUDE.md` を確認した
- [ ] 対象の変更が sample product 変更なのか、starter/harness 変更なのかを切り分けた
- [ ] 既存 docs に同じルールや決定がないか確認した
- [ ] 新しい external dependency を本当に追加すべきか見直した
- [ ] 既存の port / adapter / contract で収まるか確認した

## Slice and language

- [ ] 変更対象の slice を明確にした
- [ ] domain language を既存 glossary / ADR と衝突させていない
- [ ] sample domain を壊さずに段階的に置き換える方針になっている
- [ ] UI / route / usecase / adapter の責務を混ぜていない
- [ ] story の state 名や domain 名に曖昧語を使っていない

## Architecture and dependency direction

- [ ] `Domain <- Application <- Infrastructure <- Interface/UI` を崩していない
- [ ] domain が framework / transport / Prisma に依存していない
- [ ] application が infrastructure detail を知らない
- [ ] UI component は pure presentational に寄せ、ロジックは hook / local state transition に分けた
- [ ] 新しい外部依存は port を先に定義してから adapter を足した
- [ ] composition root で差し替え可能な接続になっている
- [ ] seed や fixture の都合を runtime adapter に埋め込んでいない

## Storybook-first UI

- [ ] UI を触る変更なら、実装前に story の目的を 1 文で言える
- [ ] default / error / success の主要状態を story に揃えた
- [ ] story を screenshot 置き場ではなく review surface として使っている
- [ ] `play` 関数で主要操作を少なくとも 1 件検証している
- [ ] story が contract card や use case の状態面と矛盾していない

## TDD and use case design

- [ ] invariant を実装前に列挙した
- [ ] domain / use case の変更なら test を先に書いた
- [ ] page component ではなく domain / application にロジックを寄せた
- [ ] use case は port 経由で依存を受ける
- [ ] adapter 追加前に application ロジック単体で成立している
- [ ] composition root から接続しても use case test の意図が崩れていない

## Boundary validation

- [ ] route input を schema で検証している
- [ ] route output を schema で検証している
- [ ] external adapter の inbound data を adapter-local contract で検証している
- [ ] external adapter の outbound data を adapter-local contract で検証している
- [ ] provider 固有 schema を domain/application に漏らしていない
- [ ] adapter 実装が same-slice の `*-contract.ts` を通している
- [ ] `npm run boundary:check` が通る

## Error handling

- [ ] 想定される失敗を invariant / business rule / authorization / missing resource / unexpected failure に分けて考えた
- [ ] domain / application では HTTP status や transport payload を直接扱っていない
- [ ] route では expected failure を stable な `code` と `status` に 1 回だけ写像している
- [ ] route では `RouteContractError` / `errorResponse` / `handleRouteError` の既存パターンを優先している
- [ ] 4xx payload は呼び出し側が修正可能な情報だけを返し、5xx で internal detail を漏らしていない
- [ ] UI は raw provider error ではなく stable な error payload を扱う
- [ ] log と telemetry に `requestId` / `status` / `code` が残る

## Local-first startup

- [ ] 外部 auth や外部 DB がなくても起動できる
- [ ] `.env.example` または生成される `.env` でローカル起動に必要な値が埋まる
- [ ] `npm run db:prepare` でローカル開発状態を再現できる
- [ ] Storybook / Vitest / Playwright を壊していない

## External providers and infrastructure continuity

- [ ] hosted provider を追加または更新するなら env contract を docs に残した
- [ ] 既存の hosted provider / deployment target を無断で置き換えていない
- [ ] env var rename / drop を行うなら migration plan がある
- [ ] 新しい provider を追加するなら repo-local `check:<provider>` command か emulator を先に用意した
- [ ] provider reachability と最小 useful action を browser / E2E / preview より前に確認した
- [ ] preview / production / docs / workflow の前提が食い違っていない
- [ ] preview / production へ進める前に `check:preview --strict-observability true` を通す運用にした

## Worktree and multi-agent

- [ ] 並列実装が必要なら canonical root 直下ではなく harness-managed worktree を使う
- [ ] worktree 名は task 単位で分けている
- [ ] `./bin/worktree-harness create <name>` で作業用 worktree を切った
- [ ] `docs/temp/worktrees/<task-id>.md` の task manifest を作成または更新した
- [ ] manifest の `owned paths` と `do not touch` を埋めた
- [ ] `./bin/worktree-harness start <name>` で app / storybook を起動できる
- [ ] `./bin/worktree-harness inspect <name>` で branch / path / pid / logPath を確認できる
- [ ] `./bin/worktree-harness logs <name> app` か `storybook` で直近ログを確認できる
- [ ] shared file に触れる変更なら serial 扱いへ戻した
- [ ] `npm run worktree:policy` が通る
- [ ] 必要なら `npm run worktree:check` で harness lifecycle を再確認した

## Logging and observability

- [ ] route handler が `requestId` を返す
- [ ] route handler が structured log を出す
- [ ] 失敗時に `code` と `requestId` を payload に含める
- [ ] worktree-local log path を agent / 人間が辿れる
- [ ] HTTP route telemetry が worktree-local traces / metrics に残る
- [ ] `./bin/worktree-harness observe <name> metrics` で集計を見られる
- [ ] `./bin/worktree-harness observe <name> traces` で直近 trace を見られる
- [ ] hosted observability 前提の設計にしていない

## Cleanup and governance

- [ ] 一時ファイルや生成物の drift を増やしていない
- [ ] cleanup script / scheduled maintenance と衝突していない
- [ ] 必要な process doc を更新した
- [ ] ADR が必要な変更か見直した
- [ ] quality/debt docs に反映すべき変更か見直した

## Review and verification

- [ ] UI 変更なら story / test / implementation を揃えた
- [ ] 変更対象に対応する unit test を追加または更新した
- [ ] harness / script / workflow 変更なら acceptance test も見直した
- [ ] `npm run typecheck` が通る
- [ ] `npm run test` が通る
- [ ] CI や review automation に載せる check は `--json` 出力で機械可読にできる
- [ ] UI 変更なら `npm run build-storybook` と `npm run test-storybook` を確認した
- [ ] 重要な harness 変更なら `npm run verify:all` を通した
- [ ] 必要なら `npm run review:suite` を通した

## Closeout

- [ ] docs の記述が実装状態に追随している
- [ ] Storybook / contract card / glossary の更新漏れがない
- [ ] quality score を上げる根拠が実装と verify にある
- [ ] debt を閉じる場合は exit condition を本当に満たしている
- [ ] worktree を使ったなら `stop` / `remove` まで片付けた
- [ ] commit message が変更の本質を表している
