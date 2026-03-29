# 第14回 ぶつからずに並行作業する

副題: parallel worktrees と task manifest は何を守っているのか

## この回の位置づけ

第13回では、quality score、debt tracker、cleanup を使って、品質を見える形で追い続ける仕組みを整理しました。

第14回では、その次の段階として、複数人や複数 AI が同時に作業してもぶつかりにくくするための仕組みを扱います。

この回の主役は `parallel worktrees`、`worktree-harness`、`task manifest` ですが、Git の高度な使い方を覚える回ではありません。
「別の机で作業する」と考えると、なぜ安全になるのかを理解する回です。

## 対象

- エンジニアではないライブコーダー
- 複数人で触ると、どこでぶつかるのかイメージしにくい人
- 並行作業を安全に進めるための考え方を知りたい人

## この回のゴール

- worktree を「別の作業机」として説明できる
- `worktree-harness` が何を自動で整えているか説明できる
- task manifest が単なるメモではなく、作業境界の合意だと理解する
- 「並行作業してよいもの」と「直列にした方がよいもの」を分けて考えられる

## この回で伝えたい中心メッセージ

- 並行作業は便利ですが、同じ場所を同時に触ると衝突しやすいです
- だから、作業場所も責任範囲も明確に分ける必要があります
- worktree は場所を分け、manifest は約束を分ける仕組みです

## 導入で使う一言

> 同じ机の上で複数人が同時に作業すると、資料も道具も混ざりやすいです。  
> 今日は、机を分けて、担当範囲も明確にする仕組みを整理します。

## セクション構成案

1. なぜ並行作業でぶつかるのか
2. worktree をやさしく言うと何か
3. worktree-harness は何をしているのか
4. task manifest は何をしているのか
5. 並行に向くものと向かないもの
6. 次回へのつながり

## 1. なぜ並行作業でぶつかるのか

### 伝えること

- 同じファイル、同じ branch、同じ起動ポートを共有するとぶつかりやすい
- 誰がどこを触っているかが見えないと、あとでまとめるのが大変になる
- だから、場所と担当を分ける必要がある

### 話す例

- 1枚の紙を同時に書き換えるより、別のコピーで作業した方が安全です
- アプリ開発でも同じで、作業机を分けるとぶつかりにくくなります

## 2. worktree をやさしく言うと何か

### やさしい説明

- 同じ repository から作る、別の作業場所
- branch も path も分けた状態で作業しやすくする

### この回での言い方

- 別の机
- 並行作業用の別作業場

### ここで伝えること

- 1人1机、1作業1机の方が整理しやすい
- 普段の単独作業では無理に使わなくてよい
- 複数の作業が同時に進む時に効いてくる

## 3. worktree-harness は何をしているのか

### やさしい説明

- worktree を作る時に、必要な準備をまとめて整える入口
- path、branch、`.env`、依存、DB、port、log などをばらばらに準備しなくて済む

### 実演コマンド例

```bash
./bin/worktree-harness create admin-publication
./bin/worktree-harness start admin-publication app
./bin/worktree-harness inspect admin-publication
./bin/worktree-harness stop admin-publication all
./bin/worktree-harness remove admin-publication --force --delete-branch
```

### この環境で自動で整えるもの

- worktree path
- branch
- `.env`
- node_modules の準備
- `db:prepare`
- app / Storybook の port
- logs と process state

### 講師が言える一言

- 手作業で1つずつ整えるより、入口を固定した方が事故が減ります
- worktree-harness は、その固定入口です

## 4. task manifest は何をしているのか

### やさしい説明

- この worktree で何をやるのかを明文化するメモ
- ただのメモというより、作業の境界線を共有するための約束書

### この回で大事な項目

- `goal`
- `scope`
- `owned paths`
- `do not touch`
- `acceptance criteria`
- `verification`
- `integration notes`

### この回での言い方

- 作業契約
- ぶつからないための約束メモ

### ここで伝えること

- 誰が何を触るかを明文化する
- 触らない場所も明文化する
- あとで別の人や AI が続きを引き継ぎやすくなる

## 5. 並行に向くものと向かないもの

### 並行に向きやすいもの

- 画面ごとに分かれる変更
- slice ごとに独立しやすい変更
- 明確に ownership を切れる変更

### 直列にした方がよいもの

- `package.json`
- `package-lock.json`
- `prisma/schema.prisma`
- `CLAUDE.md`
- `skills/core/**`

### ここで伝えること

- 並行化は何でも速くする魔法ではない
- 共有しやすい場所は、むしろ直列で進めた方が安全なことがある

### 講師が言える一言

- 分けられるものを分けるのであって、分けにくいものまで無理に分けないのが大事です

## 6. 次回へのつながり

### 次回予告

- 第15回では、外部サービスを安全に足すための local provider checks に進む
- ここからは並行作業から、環境の外へ広がる依存をどう扱うかへ移る

## この回で出してよい用語

- worktree
- branch
- manifest
- owned paths
- do not touch
- port
- parallel
- serial

## この回ではまだ深入りしないこと

- Git worktree の内部仕様
- merge/rebase の詳細手順
- worktree policy の実装細部
- trace / metrics の詳細

## 実演の流れ案

1. 同じ場所を同時に触るとぶつかると話す
2. worktree を「別の机」として説明する
3. `./bin/worktree-harness create ...` を見せる
4. `inspect` で branch / path / url を確認する
5. task manifest の項目を見せる
6. 並行に向くものと向かないものを整理する

## 実演時に講師が言える一言

- 並行作業で大事なのは、速さだけでなく衝突の少なさです
- worktree は場所を分け、manifest は責任範囲を分けます
- 無理に何でも並行化しないことも安全設計の一部です

## 受講者にやってもらう最小課題

- worktree を一言で説明する
- task manifest が何を助けるかを一言で説明する
- `owned paths` と `do not touch` の意味を説明する
- 並行に向く変更と向かない変更を1つずつ挙げる

## 受講後に残したい理解

- worktree は並行作業用の別机
- task manifest は作業境界を共有する約束書
- 並行化は便利だが、分け方を誤ると逆に危ない
- 次回は、外部サービスを安全に足すための確認の話へ進む

## 締めの一言案

> 今日は、ぶつからずに並行作業するための worktree と manifest を整理しました。  
> 次回は、外部サービスを安全に足すための local provider checks に進みます。
