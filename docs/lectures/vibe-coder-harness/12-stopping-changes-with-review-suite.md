# 第12回 review suite で変更をどこで止めるか

副題: AI review を gate にするとはどういうことか

## この回の位置づけ

第11回では、project-local skills と review wrapper を通して、AI にこの repo の流儀を守ってもらう仕組みを整理しました。

第12回では、その review の入口が、実際にはどこで変更を止める gate になっているのかを扱います。

この回の主役は `review:suite`、specialist review、threshold ですが、厳密な CI 設計の話をする回ではありません。
「チェックは通したのに、さらに review で止めるのはなぜか」を理解する回です。

## 対象

- エンジニアではないバイブコーダー
- チェックとレビューの違いがまだ曖昧な人
- 「どこまで自動で止めて、どこから人が判断するのか」を整理したい人

## この回のゴール

- チェックと review の役割の違いを説明できる
- `review:suite` が何をまとめているかを説明できる
- architecture / security / performance review を分ける意味が分かる
- 「変更をどこで止めるか」を仕組みで決める発想を持てる

## この回で伝えたい中心メッセージ

- チェックは主に壊れを見つける仕組みです
- review は、変更の質や方向が妥当かを見る仕組みです
- gate は「止めるための嫌な壁」ではなく、危ない変更を通しにくくする線引きです

## 導入で使う一言

> 動くことと、安心して通してよいことは別です。  
> 今日は、その境目をどこに置くのかを review suite を使って整理します。

## セクション構成案

1. なぜチェックだけでは足りないのか
2. review は何を見るのか
3. review:suite は何をしているのか
4. threshold で何を止めているのか
5. この環境での現状
6. 次回へのつながり

## 1. なぜチェックだけでは足りないのか

### 伝えること

- format、lint、typecheck、test が通っても、それだけで変更の方向がよいとは限らない
- 設計として危ない、セキュリティ的に不安、将来重くなりそう、という問題は別で見る必要がある
- だから、チェックとは別に review の入口が必要になる

### 話す例

- 文章に誤字がなくても、内容が妥当とは限りません
- コードも同じで、動くことと、進めてよいことは別です

## 2. review は何を見るのか

### この環境で分かれている review

- architecture
- security
- performance

### やさしい説明

- architecture: 構造や役割の混ざり方を見る
- security: 入力や認証や漏れてはいけない情報を見る
- performance: 重くなりそうな流れや描画を見る

### この回での言い方

- 構造を見る review
- 安全性を見る review
- 重さを見る review

### ここで伝えること

- 1つの review で全部を見るのは難しい
- 観点を分けると、何を見ているのかがはっきりする

## 3. review:suite は何をしているのか

### やさしい説明

- 変更内容を見て、必要な review を選び、まとめて実行する入口
- 毎回全部を雑に走らせるのではなく、変更範囲に応じて review を決める

### 実演コマンド

```bash
npm run review:suite
```

### この回で伝えること

- 変更ファイルを見て対象を絞る
- 必要な review だけを走らせる
- 結果を report として残す

### 補助的に見せられる入口

```bash
./bin/codex-review architecture src
./bin/codex-review security src
./bin/codex-review performance src
```

### 講師が言える一言

- review:suite は review のまとめ窓口です
- specialist review を project の流れに乗せるための入口だと考えると分かりやすいです

## 4. threshold で何を止めているのか

### やさしい説明

- threshold は「ここより重い問題は通さない」という線
- つまり、review 結果をそのまま眺めるだけでなく、止める基準を持つ

### この環境での考え方

- severity が高い問題は breach として扱う
- breach が出たら、その変更はそのまま通しにくくなる

### この回での言い方

- 止める線
- 通してよいかの基準

### ここで伝えること

- gate がないと、review が「読むだけの感想」で終わりやすい
- threshold があると、止める判断を仕組みに寄せられる

## 5. この環境での現状

### 伝えること

- review automation はかなり整っている
- ただし、実 Codex 実行はまだ opt-in の部分がある
- つまり、完成済みではあるが、完全自動の最終形ではない

### この回で伝える現在地

- `quality-score` では review automation は `2`
- `tech-debt-tracker` では CI review execution が open

### 講師が言える一言

- この環境は「review を仕組みに乗せる」ところまでは進んでいます
- ただし、全部を無条件で自動化しているわけではありません
- だからこそ、今どこまでできていて、何が未完了かを見えるようにしています

## 6. 次回へのつながり

### 次回予告

- 第13回では、quality score、debt tracker、cleanup を使って、品質を見える化する話に進む
- ここで gate の話が、見える運用の話につながる

## この回で出してよい用語

- review
- review:suite
- architecture
- security
- performance
- threshold
- severity
- gate

## この回ではまだ深入りしないこと

- review schema の細部
- GitHub Actions の実装
- report JSON の詳細構造
- Codex 実行オプションの細部

## 実演の流れ案

1. チェックと review の違いを整理する
2. architecture / security / performance の分け方を説明する
3. `npm run review:suite` を見せる
4. specialist review の個別入口も見せる
5. threshold を「止める線」として説明する
6. 現状は完全自動ではないことも含めてまとめる

## 実演時に講師が言える一言

- 動くことは最低条件で、review はその上の確認です
- gate は、変更を嫌がっているのではなく、危ない通し方を減らすためにあります
- 完成度を見せるだけでなく、未完了も見える化しているのがこの環境の特徴です

## 受講者にやってもらう最小課題

- `npm run review:suite` を実行する
- architecture / security / performance の違いを一言ずつ説明する
- threshold を一言で説明する
- 「チェック」と「review」の違いを一言で説明する

## 受講後に残したい理解

- チェックと review は役割が違う
- review:suite は specialist review のまとめ入口
- threshold があると、止める基準を仕組みに寄せられる
- 次回は、品質を見える形で追い続ける仕組みに進む

## 締めの一言案

> 今日は、review suite を使って変更をどこで止めるかを整理しました。  
> 次回は、quality score や debt tracker を使って、品質を見える形で追う話へ進みます。
