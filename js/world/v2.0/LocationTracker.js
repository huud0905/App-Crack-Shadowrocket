/*
 * LocationTracker v3
 * Chạy cron trong Shadowrocket mỗi phút.
 * Fetch tọa độ từ GitHub Gist → ghi vào $persistentStore
 * IOS_Location_Spoofer tự đọc từ $persistentStore → fake cho app
 */

(function () {

  var GIST_URL = "https://gist.githubusercontent.com/huud0905/3fc20032e4c73b6181314df6bce10af1/raw/location.json";

  function writeStore(key, value) {
    try {
      if (typeof $persistentStore !== "undefined") {
        $persistentStore.write(String(value), key);
      }
    } catch(e) {}
  }

  if (typeof $httpClient === "undefined") {
    console.log("[Tracker] $httpClient unavailable");
    $done({});
    return;
  }

  // Thêm timestamp tránh cache
  $httpClient.get(
    { url: GIST_URL + "?t=" + Date.now(), timeout: 8000 },
    function(err, resp, body) {
      if (err || !body) {
        console.log("[Tracker] Fetch failed: " + (err || "empty"));
        $done({});
        return;
      }
      try {
        var d = JSON.parse(body);
        if (!isFinite(d.latitude) || !isFinite(d.longitude)) throw new Error("invalid");

        writeStore("latitude",  d.latitude.toFixed(6));
        writeStore("longitude", d.longitude.toFixed(6));

        console.log("[Tracker] " + d.latitude.toFixed(4) + ", " + d.longitude.toFixed(4));
      } catch(e) {
        console.log("[Tracker] Parse error: " + e.message);
      }
      $done({});
    }
  );

})();
