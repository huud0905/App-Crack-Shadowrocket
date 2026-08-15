/*
 * LocationTracker.js v2
 * Chạy cron trong Shadowrocket mỗi phút.
 * Fetch tọa độ giả từ GitHub Gist (do Scriptable push lên)
 * → ghi vào $persistentStore để IOS_Location_Spoofer đọc.
 */

(function () {

  var GIST_RAW_URL = "https://gist.githubusercontent.com/huud0905/3fc20032e4c73b6181314df6bce10af1/raw/location.json";

  function writeStore(key, value) {
    try {
      if (typeof $persistentStore !== "undefined" && $persistentStore.write) {
        $persistentStore.write(String(value), key);
      }
    } catch (e) {}
  }

  if (typeof $httpClient === "undefined" || !$httpClient.get) {
    console.log("[LocationTracker] $httpClient unavailable");
    $done({});
    return;
  }

  // Thêm timestamp để tránh cache
  var url = GIST_RAW_URL + "?t=" + Date.now();

  $httpClient.get({ url: url, timeout: 8000 }, function (err, resp, body) {
    if (err || !body) {
      console.log("[LocationTracker] Fetch failed: " + (err || "empty body"));
      $done({});
      return;
    }

    try {
      var data = JSON.parse(body);
      if (!isFinite(data.latitude) || !isFinite(data.longitude)) {
        throw new Error("invalid coords");
      }

      writeStore("latitude",  data.latitude.toFixed(6));
      writeStore("longitude", data.longitude.toFixed(6));

      console.log("[LocationTracker] Updated: " + data.latitude.toFixed(4) + ", " + data.longitude.toFixed(4));
    } catch (e) {
      console.log("[LocationTracker] Parse error: " + e.message);
    }

    $done({});
  });

})();
