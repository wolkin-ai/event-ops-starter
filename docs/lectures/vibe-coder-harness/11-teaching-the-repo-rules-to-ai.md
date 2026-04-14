# 第11回 AI にこの環境の流儀を守ってもらう

副題: project-local skills と review wrapper は何のためにあるのか

## この回の位置づけ

第10回では、失敗を安定した形で返す考え方を整理しました。

第11回では、ここまで見てきた流儀を、人だけでなく AI にも守ってもらうための仕組みを扱います。

この回の主役は `project-local skills`、`skills:sync`、`skills:validate`、review wrapper ですが、AI 活用の一般論に寄り道しない章です。
この repository の中にルールと振る舞いを持たせると、なぜ作業が安定するのかをつかむ回です。

## 対象

- エンジニアではないバイブコーダー
- AI に何をどこまで任せるべきかまだ曖昧な人
- 「同じ repo でも、人によってAIの出力がぶれる」ことに不安がある人

## この回のゴール

- project-local skills が何のためにあるか説明できる
- `skills/core` が source of truth である意味を説明できる
- `skills:sync` と `skills:validate` の役割をざっくり説明できる
- review wrapper が AI のレビュー入口として何をしているか理解する

## この章の中心メッセージ

- AI を便利に使うだけでは、同じ作業を安定して繰り返しにくい
- だから、この repo の中に「どう動くべきか」を持たせる
- AI の振る舞いを個人のPC任せにせず、project-local に寄せることが大事です

## 導入のひとこと

> AI が賢いことと、この repo の流儀を守ってくれることは別です。  
> 今日は、その流儀を repo の中に置いて、AI にも読ませる仕組みを整理します。

## セクション構成案

1. なぜ AI の振る舞いを repo の中に置くのか
2. project-local skills は何をしているのか
3. `skills:sync` と `skills:validate` は何をしているのか
4. review wrapper は何をしているのか
5. この仕組みがあると何が楽か
6. 次回へのつながり

## 1. なぜ AI の振る舞いを repo の中に置くのか

### 押さえるポイント

- AI はその場で賢く答えても、毎回同じ流儀で動くとは限らない
- 人によって使う環境や設定が違うと、出力もぶれやすい
- だから、この project では「どう動くか」を repo の中に置く

### 身近なたとえ

- 同じチームでも、口頭ルールだけだと人によってやり方がずれます
- AI も同じで、毎回同じ入口を用意した方が安定します

## 2. project-local skills は何をしているのか

### やさしい説明

- この repo で AI が守るべき流れや役割をまとめた手順書
- 使う順番、注意点、出力のしかたを project に合わせて持たせる

### この回での言い方

- AI 用の手順書
- repo の中に置く作業ルール

### この環境で大事なこと

- `skills/core` が正本
- `.claude/skills` と `.agents/skills` は adapter 層
- ホーム配下の skill に依存しない

### ここで整理すること

- 正本が repo の中にあると、チームで共有しやすい
- project ごとの流儀を外に逃がさずに済む
- つまり、「この repo ではこう動く」がはっきりする

## 3. `skills:sync` と `skills:validate` は何をしているのか

### `skills:sync` のやさしい説明

- 正本 skill から adapter を作り直してそろえる
- 入口ごとの差を減らすための同期

### 実行するコマンド

```bash
npm run skills:sync
```

### `skills:validate` のやさしい説明

- skill の形が壊れていないか確認する
- 必要な section があるか
- adapter がずれていないか
- 変な参照先になっていないか

### 実行するコマンド

```bash
npm run skills:validate
```

### この章で整理すること

- AI 用の手順書も、置くだけでは足りない
- 同期して、壊れていないか確認して、はじめて安定する

## 4. review wrapper は何をしているのか

### やさしい説明

- AI にレビューさせる時の入口を project 側でそろえる仕組み
- 何をレビューするか、どこを見るか、どこへ出力するかを一定にしやすい

### この回での言い方

- AI レビューの窓口
- project-local なレビュー入口

### このリポジトリの入り口になるファイル

```bash
./bin/codex-review architecture src
./bin/codex-review security src
./bin/codex-review performance src
npm run review:suite
```

### ここで整理すること

- その場その場で AI に自由入力するより、入口が決まっている方が再現しやすい
- review の観点も、architecture / security / performance のように分けられている
- つまり、AI にも「どの立場で見るか」を持たせている

## 5. この仕組みがあると何が楽か

### 押さえるポイント

- 人が変わっても、AI の入口をそろえやすい
- project 固有の流儀がぶれにくい
- review も implementation も、同じ repository の中でたどりやすい

### 要点をひとことで

- AI を万能に信じるのではなく、repo 側でレールを敷くのが大事です
- project-local skills は、そのレールを visible にするための仕組みです

## 6. 次回へのつながり

### 次回予告

- 第12回では、review suite を使って「変更をどこで止めるか」を扱う
- ここで AI review の入口が、実際の gate とどうつながるかを見る

## この回で出してよい用語

- skill
- project-local
- 正本
- adapter
- sync
- validate
- review wrapper
- source of truth

## この回ではまだ深入りしないこと

- skill frontmatter の細かい仕様
- adapter 生成スクリプトの実装詳細
- review schema の詳細
- CI 連携の細部

## おすすめの進め方

1. AI の出力がぶれやすい理由を自分の言葉で整理する
2. `skills/core` が正本である、という地図を頭に置く
3. `npm run skills:sync` を実行して結果を確認する
4. `npm run skills:validate` を実行して結果を確認する
5. `./bin/codex-review architecture src` と `npm run review:suite` を実行して結果を確認する
6. AI にも repo の流儀を読ませる意味をまとめる

## 進めながら頭に置く一句

- AI の振る舞いを repo の外に置くと、再現性が落ちやすいです
- 正本と adapter を分けると、管理しやすくなります
- review wrapper があると、AI レビューも project の流れに乗せやすいです

## 受講者にやってもらう最小課題

- `skills/core` が何の置き場かを一言で言い換えてみる
- `npm run skills:sync` を実行する
- `npm run skills:validate` を実行する
- review wrapper が何を助けるかを一言で言い換えてみる

## 受講後に残したい理解

- AI の振る舞いも project-local に寄せると安定しやすい
- `skills/core` は AI 用の手順書の正本
- `skills:sync` と `skills:validate` は、その手順書をそろえて壊れていないか見る
- 次回は、review suite で変更をどこで止めるかに進む

## 締めのひとこと

> 今日は、AI にこの環境の流儀を守ってもらう仕組みを整理しました。  
> 次回は、その流儀を review suite でどう gate にするかへ進みます。
