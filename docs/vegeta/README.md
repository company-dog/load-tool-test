# Vegetaの使い方

https://github.com/tsenart/vegeta

## 使ってみて物足りないとおもったこと

- シナリオの場合に、複数のエンドポイントを指定できるが、レスポンスの結果を次のリクエストのパラメータに指定することができなさそう。
- シナリオの場合に、複数のエンドポイントを指定できるが、エンドポイントごとのレポーティング、グラフ表示に対応してなさそう。
- ランプアップなどの細かい指定ができない。

## はじめかた

Installはここから
https://github.com/tsenart/vegeta/releases

```
vegeta -version

Version: 12.8.3
Commit:
Runtime: go1.14 darwin/amd64
Date: 2020-03-25T14:41:40Z
```

## 結果の出力方法

### encode

リアルタイムに標準出力確認

```
echo 'GET http://localhost:5500' | vegeta attack -duration=5s | vegeta encode
```

### report

標準出力にレポート出力

```
# text出力
echo 'GET http://localhost:5500' | vegeta attack -duration=5s | vegeta report -type=json

# json出力
echo 'GET http://localhost:5500' | vegeta attack -duration=5s | vegeta report -type=json
```

### plot

```
echo 'GET http://localhost:5500' | vegeta attack -duration=5s | vegeta plot -title='Sample Plotting' > report.html
```


## 特定のURLに集中して負荷をかける

### GETリクエスト

```
echo 'GET http://localhost:5500' | vegeta attack -duration=5s -rate=3 | vegeta report -type=text

Requests      [total, rate, throughput]         250, 50.19, 50.18
Duration      [total, attack, wait]             4.982s, 4.981s, 858.591µs
Latencies     [min, mean, 50, 90, 95, 99, max]  555.699µs, 1.457ms, 944.653µs, 3.022ms, 3.789ms, 8.551ms, 15.49ms
Bytes In      [total, mean]                     4500, 18.00
Bytes Out     [total, mean]                     0, 0.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:250  
Error Set:
```

**意味**

- Requests
  - total: 全実行回数
  - rate: 秒間の実行回数
- Duration
  - total: 負荷をかけるのに要した時間（attack＋wait）
  - attack: 全リクエストを実行するのに要した時間（total - wait）
  - wait: レスポンスを待っている時間
- Latencies: 平均、50％、95％、99％パーセンタイル、最大値
- Bytes In / Bytes Out: リクエスト／レスポンスの送受信のバイト数
- Successes: リクエストの成功率（なお、200と400がエラーとしてカウントされない）
- Status Codes: ステータスコードのヒストグラム
- Error Set: 失敗したリクエストとその内容

### POSTリクエスト

```
echo 'POST http://localhost:5500/ping' | \
  vegeta attack -duration=5s -body=data/body.json -header='Content-Type: application/json' | \
  vegeta report

Requests      [total, rate, throughput]         250, 50.20, 50.18
Duration      [total, attack, wait]             4.982s, 4.98s, 2.034ms
Latencies     [min, mean, 50, 90, 95, 99, max]  614.717µs, 1.155ms, 965.858µs, 1.664ms, 2.246ms, 3.359ms, 5.089ms
Bytes In      [total, mean]                     3000, 12.00
Bytes Out     [total, mean]                     7750, 31.00
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:250  
Error Set:
```

## シナリオテスト

`data/test-scenario.txt`を用意する

```txt
GET http://localhost:5500

GET http://localhost:5500/ping?message=pongpong

POST http://localhost:5500/ping
Content-Type: application/json
@./data/body.json
```

```
vegeta attack -targets=data/test-scenario.txt -duration=5s | vegeta report

Requests      [total, rate, throughput]         250, 50.20, 50.18
Duration      [total, attack, wait]             4.982s, 4.98s, 1.808ms
Latencies     [min, mean, 50, 90, 95, 99, max]  538.296µs, 1.009ms, 768.875µs, 1.492ms, 2.598ms, 4.943ms, 8.228ms
Bytes In      [total, mean]                     3172, 12.69
Bytes Out     [total, mean]                     2573, 10.29
Success       [ratio]                           100.00%
Status Codes  [code:count]                      200:250  
Error Set:
```