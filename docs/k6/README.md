# K6

https://k6.io/

## はじめかた

```
$ brew install k6

$ k6 version
k6 v0.26.2 (dev build, go1.14, darwin/amd64)
```

```
$ docker pull loadimpact/k6

$ docker run --rm loadimpact/k6 version
k6 v0.26.2 (2020-03-18T12:07:04+0000/v0.26.2-0-g459da79e, go1.13.8, linux/amd64)
```


```
yarn init -y
yarn add k6
```

## 負荷をかける

`k6script`という名前でファイルを作る。

```js
import http from "k6/http";
import { sleep } from "k6";

export default function () {
  http.get("http://localhost:5500");
  sleep(1);
}
```

`k6script.js`を記述する

```js
import http from "k6/http";
import { sleep } from "k6";

export default function () {
  http.get("http://localhost:5500");
  sleep(1);
}
```

また、POSTリクエストの場合は、以下のように書く。

```js
import http from 'k6/http';

export default function() {
  var url = 'http://localhost:5500/ping';
  var payload = JSON.stringify({
    message: 'Hello K6'
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}
```


```
# 同時接続ユーザ数10, 負荷がけ時間5sで実行
k6 run --vus 10 --duration 5s k6script.js


          /\      |‾‾|  /‾‾/  /‾/   
     /\  /  \     |  |_/  /  / /    
    /  \/    \    |      |  /  ‾‾\  
   /          \   |  |‾\  \ | (_) | 
  / __________ \  |__|  \__\ \___/ .io

  execution: local
     output: -
     script: k6script.js

    duration: 30s, iterations: -
         vus: 10,  max: 10

    done [==========================================================] 30s / 30s

    data_received..............: 65 kB 2.2 kB/s
    data_sent..................: 23 kB 773 B/s
    http_req_blocked...........: avg=118.44µs min=1µs   med=4µs   max=4.65ms p(90)=7.1µs   p(95)=16.3µs  
    http_req_connecting........: avg=54.92µs  min=0s    med=0s    max=2.39ms p(90)=0s      p(95)=0s      
    http_req_duration..........: avg=1.4ms    min=395µs med=969µs max=7.07ms p(90)=2.66ms  p(95)=4.25ms  
    http_req_receiving.........: avg=78.38µs  min=12µs  med=50µs  max=1.69ms p(90)=106.3µs p(95)=146.25µs
    http_req_sending...........: avg=44.85µs  min=7µs   med=17µs  max=2.3ms  p(90)=37µs    p(95)=78.1µs  
    http_req_tls_handshaking...: avg=0s       min=0s    med=0s    max=0s     p(90)=0s      p(95)=0s      
    http_req_waiting...........: avg=1.28ms   min=357µs med=857µs max=6.73ms p(90)=2.54ms  p(95)=4.16ms  
    http_reqs..................: 300   9.999923/s
    iteration_duration.........: avg=1s       min=1s    med=1s    max=1.01s  p(90)=1s      p(95)=1s      
    iterations.................: 290   9.666592/s
    vus........................: 10    min=10 max=10
    vus_max....................: 10    min=10 max=10
```

### コマンドで指定したパラメータをコードに記述する


`k6script.js`に`options`を追加する。

```js
import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 10,
  duration: "5s",
};

export default function () {
  http.get("http://localhost:5500");
  sleep(1);
}
```

実行すると、同様の結果が得られる

```
k6 run k6script.js
```

### 同時接続数のramping up / ramping down 指定


```js
import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 10,
  stages: [
    { duration: "20s", target: 20 },
    { duration: "10s", target: 20 },
    { duration: "20s", target: 0 },
  ],
};

export default function () {
  const res = http.get("http://localhost:5500/ping?message=111");
  check(res, {
    'status was 200': r => r.status == 200,
    'transaction time OK': r => r.timings.duration < 200,
  });
  sleep(1);
}
```

### レスポンス結果のcheck

```js
import http from "k6/http";
import { sleep, check } from "k6";

export let options = {
  vus: 10,
  duration: "5s",
};

export default function () {
  const res = http.get("http://localhost:5500/ping?message=111");
  check(res, {
    "status was 200": (r) => r.status == 200,
    "transaction time OK": (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

## 出力先の指定

デフォルトは標準出力だが、指定することができる。
以下は、実行結果を`test.json`とinfluxDBに登録する例。

```
k6 run --out json=test.json --out influxdb=http://localhost:8086/k6 k6script.js
```

###  用意したdocker-compose.ymlを使ってVisualizeする。

```
# GrafanaとInfluxDBを起動する
docker-compose up 

# スクリプトの実行
k6 run --out influxdb=http://localhost:8086/k6 k6script.js
```

http://localhost:3001
にアクセスして、ダッシュボードを設定する。
ダッシュボードのテンプレートとして、以下が利用できるので、これを使うと楽。
https://grafana.com/grafana/dashboards/2587