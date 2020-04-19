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
