# 第15回 外部サービスを安全に足す

副題: local provider checks と infrastructure continuity は何を守っているのか

## この回の位置づけ

第14回では、parallel worktrees と task manifest を使って、複数人や複数 AI がぶつからずに並行作業する仕組みを整理しました。

第15回では、その次の段階として、アプリの外にあるサービスをどう安全に足すかを扱います。

この回の主役は `local provider checks` と `infrastructure continuity` ですが、クラウド構成の専門知識を覚える回ではありません。
「外部サービスをつないだ時に、どこから確認し、何を勝手に壊してはいけないか」を理解する回です。

## 対象

- エンジニアではないライブコーダー
- 外部サービスの接続で、どこから確認すればよいか分からない人
- preview や production の話になると急に不安になる人

## この回のゴール

- `check:<provider>` の考え方を説明できる
- ブラウザより先に CLI で確認する意味を説明できる
- environment variable や provider account を勝手に変えない理由を説明できる
- `local provider checks` と `infrastructure continuity` の役割の違いを理解する

## この回で伝えたい中心メッセージ

- 外部サービスは、つながった瞬間から「自分の外」の要素が増えます
- だから、まず小さく確かめてから広げる順番が大事です
- 既に使っている provider や env 名を無意識に変えると、動いていたものまで壊れます

## 導入で使う一言

> 外部サービスを足すと、急に不具合の場所が見えにくくなります。  
> 今日は、どこから順番に確かめると安全かを整理します。

## セクション構成案

1. なぜ外部サービスは難しくなるのか
2. local provider checks は何をしているのか
3. まずは CLI から確認する理由
4. infrastructure continuity は何を守っているのか
5. この環境での入口
6. 次回へのつながり

## 1. なぜ外部サービスは難しくなるのか

### 伝えること

- 画面の外にある要素が増えると、どこで失敗しているのか切り分けにくくなる
- UI の問題なのか、env の問題なのか、provider 側の設定なのかが混ざりやすい
- だから、確認の順番を決めておく必要がある

### 話す例

- 電気がつかない時に、いきなり部屋全体を疑うより、まずコンセントやスイッチを見た方が速いです
- 外部サービスも同じで、小さい確認から始めた方が原因を絞りやすいです

## 2. local provider checks は何をしているのか

### やさしい説明

- 外部サービスが使えるかを、ブラウザより先に CLI で確かめる入口
- provider ごとに、最小限の確認を repo の中に持つ考え方

### この回での言い方

- 外部サービスの事前点検
- ブラウザ前の確認入口

### この回で大事な流れ

1. env contract を決める
2. `npm run check:<provider>` を作る
3. 最小 useful action を CLI で試す
4. その後に browser / preview / production へ広げる

### 講師が言える一言

- いきなりブラウザから試すと、失敗場所が混ざりやすいです
- 先に CLI で通すと、外部サービス自体が生きているかを切り分けやすくなります

## 3. まずは CLI から確認する理由

### 先に見るべきもの

- env が足りているか
- endpoint や project が合っているか
- 認証が通るか
- 最小の useful action が通るか

### この回で伝えること

- 最初の再現手段が browser だと、UI 問題と provider 問題が混ざる
- CLI なら、より小さい単位で失敗を切り分けられる
- その確認が将来の incident 対応の入口にもなる

### 話す例

- 配信機材でいうと、まずケーブル単体や音声入力を確認してから全体をつなぐ感覚に近いです

## 4. infrastructure continuity は何を守っているのか

### やさしい説明

- すでに使っている hosted provider や deploy の前提を、うっかり壊さないための考え方
- 実装を変えても、接続先や env 契約は勝手に変えない

### この回での言い方

- 既存接続を守るルール
- 勝手に置き換えないための考え方

### この回で伝えること

- 既存の provider account は勝手に変えない
- 既存の env var 名は無断で rename / drop しない
- preview / production と docs / workflow は一緒に動かす

### 講師が言える一言

- 実装を直すことと、接続先を変えることは別の重さの変更です
- 後者には migration plan が必要です

## 5. この環境での入口

### generic にある入口

```bash
npm run check:observability
npm run check:preview -- --base-url http://127.0.0.1:3000
```

### provider check の名前の例

```bash
npm run check:<provider> -- status
npm run check:<provider> -- smoke
npm run check:<provider> -- <smallest-useful-action>
```

### preview へ進む前の順番

1. `npm run check:<provider> -- status`
2. `npm run check:observability`
3. `npm run check:preview -- --base-url https://<preview-domain>`
4. その後で browser / E2E / promotion

### ここで伝えること

- 名前をそろえると、入口が分かりやすい
- 順番をそろえると、切り分けしやすい
- JSON 出力があると review automation や CI にもつなげやすい

## 6. 次回へのつながり

### 次回予告

- 第16回では、ここまで後回しにしてきた「役割を混ぜない設計」に入る
- ここで初めて、Clean Architecture を非エンジニア向けにやさしく整理する

## この回で出してよい用語

- provider
- env
- check
- preview
- production
- continuity
- migration plan
- CLI

## この回ではまだ深入りしないこと

- 各クラウドの細かい設定
- secret rotation の詳細
- deploy pipeline の詳細実装
- observability backend の構築

## 実演の流れ案

1. 外部サービスが入ると切り分けが難しくなると話す
2. `check:<provider>` の考え方を説明する
3. `npm run check:observability` を見せる
4. `npm run check:preview -- --base-url http://127.0.0.1:3000` を見せる
5. continuity のルールを説明する
6. 「小さく確認してから広げる」とまとめる

## 実演時に講師が言える一言

- いきなり browser から試さないのが大事です
- 先に CLI で provider 自体の確認をすると、原因を絞りやすいです
- 既存の env 名や provider account を変える時は、単なる refactor では済みません

## 受講者にやってもらう最小課題

- `check:<provider>` が何のためにあるかを一言で説明する
- `npm run check:observability` を実行する
- `npm run check:preview -- --base-url http://127.0.0.1:3000` を実行する
- continuity が何を守っているかを一言で説明する

## 受講後に残したい理解

- 外部サービスは、まず小さい確認から始めた方が安全
- local provider checks は、ブラウザ前の確認入口
- infrastructure continuity は、既存の接続先や env 契約を守る考え方
- 次回は、役割を混ぜない設計へ進む

## 締めの一言案

> 今日は、外部サービスを安全に足すための確認順序と continuity を整理しました。  
> 次回は、ここまで後回しにしてきた「役割を混ぜない設計」に進みます。
