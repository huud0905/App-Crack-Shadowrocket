/*
 * LocationTracker.js
 * Chạy định kỳ (cron) trong Shadowrocket.
 * - Đọc GPS thật của máy
 * - Tính tọa độ giả = GPS thật + offset đến điểm fake
 * - Ghi vào $persistentStore để IOS_Location_Spoofer đọc
 *
 * Cài trong Shadowrocket:
 *   type = cron
 *   script-path = <đường dẫn file này>
 *   cronexp = * * * * * (chạy mỗi phút, hoặc ** * * mỗi 2 phút)
 */

(function () {

  // ─────────────────────────────────────────────
  // CẤU HÌNH — chỉ cần sửa phần này
  // ─────────────────────────────────────────────

  // Tọa độ thật của bạn ở Hà Nội (điểm xuất phát khi bắt đầu)
  // Script sẽ tự tính offset dựa trên lần đọc GPS đầu tiên
  // nhưng cần một điểm "anchor" ban đầu để tính offset.
  // → Chỉ cần ghi tọa độ nhà/nơi hay dùng nhất, sau đó script tự điều chỉnh.
  var ANCHOR_REAL = {
    latitude:  21.0285,   // Tọa độ thật của bạn (Hà Nội)
    longitude: 105.8542
  };

  // Điểm fake tương ứng với ANCHOR_REAL ở trên
  // Khi bạn đứng tại ANCHOR_REAL → app thấy bạn ở đây
  var ANCHOR_FAKE = {
    latitude:  55.7558,   // Moscow mặc định — đổi tuỳ thích
    longitude: 37.6173
  };

  // ─────────────────────────────────────────────
  // PRESET SẴN — gọi setPreset("moscow") để đổi nhanh
  // ─────────────────────────────────────────────
  var PRESETS = {
    moscow:  { latitude: 55.7558,  longitude: 37.6173  },
    berlin:  { latitude: 52.5200,  longitude: 13.4050  },
    paris:   { latitude: 48.8566,  longitude:  2.3522  },
    london:  { latitude: 51.5074,  longitude: -0.1278  },
    tokyo:   { latitude: 35.6762,  longitude: 139.6503 },
    newyork: { latitude: 40.7128,  longitude: -74.0060 },
    sydney:  { latitude: -33.8688, longitude: 151.2093 }
  };

  // ─────────────────────────────────────────────
  // ĐỌC CONFIG HIỆN TẠI (do người dùng set qua UI hoặc script khác)
  // ─────────────────────────────────────────────
  function readStore(key) {
    try {
      if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
        var v = $persistentStore.read(key);
        return (v != null && v !== "") ? v : null;
      }
    } catch (e) {}
    return null;
  }

  function writeStore(key, value) {
    try {
      if (typeof $persistentStore !== "undefined" && $persistentStore.write) {
        $persistentStore.write(key, String(value));
      }
    } catch (e) {}
  }

  // Đọc anchor fake hiện tại từ store (người dùng có thể đổi qua UI)
  function loadFakeAnchor() {
    var lat = parseFloat(readStore("fake_anchor_lat"));
    var lng = parseFloat(readStore("fake_anchor_lng"));
    if (isFinite(lat) && isFinite(lng)) {
      return { latitude: lat, longitude: lng };
    }
    // Lần đầu: dùng ANCHOR_FAKE mặc định, lưu lại
    writeStore("fake_anchor_lat", String(ANCHOR_FAKE.latitude));
    writeStore("fake_anchor_lng", String(ANCHOR_FAKE.longitude));
    return ANCHOR_FAKE;
  }

  // Đọc anchor real từ store (lần đầu chạy sẽ tự lưu từ GPS)
  function loadRealAnchor() {
    var lat = parseFloat(readStore("real_anchor_lat"));
    var lng = parseFloat(readStore("real_anchor_lng"));
    if (isFinite(lat) && isFinite(lng)) {
      return { latitude: lat, longitude: lng };
    }
    return null; // chưa có → dùng GPS lần đầu làm anchor
  }

  // ─────────────────────────────────────────────
  // TÍNH TOÁN OFFSET VÀ TỌA ĐỘ GIẢ
  // ─────────────────────────────────────────────
  function calcFakePosition(realLat, realLng, realAnchor, fakeAnchor) {
    // Độ lệch so với anchor thật
    var deltaLat = realLat - realAnchor.latitude;
    var deltaLng = realLng - realAnchor.longitude;

    // Áp độ lệch đó vào anchor fake
    var fakeLat = fakeAnchor.latitude + deltaLat;
    var fakeLng = fakeAnchor.longitude + deltaLng;

    // Clamp về phạm vi hợp lệ
    fakeLat = Math.max(-90,  Math.min(90,  fakeLat));
    fakeLng = Math.max(-180, Math.min(180, fakeLng));

    return { latitude: fakeLat, longitude: fakeLng };
  }

  // ─────────────────────────────────────────────
  // ĐỌC GPS THẬT QUA $httpClient (Shadowrocket không có API GPS trực tiếp)
  // Dùng ip-api.com để lấy vị trí xấp xỉ qua IP — không cần GPS permission
  // Nếu muốn chính xác hơn: cần Scriptable app (xem ghi chú bên dưới)
  // ─────────────────────────────────────────────
  function fetchRealLocation(callback) {
    if (typeof $httpClient === "undefined" || !$httpClient.get) {
      callback(null, "httpClient unavailable");
      return;
    }
    $httpClient.get(
      { url: "http://ip-api.com/json/?fields=lat,lon,status", timeout: 5000 },
      function (err, resp, body) {
        if (err || !body) {
          callback(null, err || "empty body");
          return;
        }
        try {
          var data = JSON.parse(body);
          if (data.status === "success" && isFinite(data.lat) && isFinite(data.lon)) {
            callback({ latitude: data.lat, longitude: data.lon }, null);
          } else {
            callback(null, "ip-api returned: " + body);
          }
        } catch (e) {
          callback(null, e.message);
        }
      }
    );
  }

  // ─────────────────────────────────────────────
  // HÀM CÔNG KHAI — đổi điểm fake nhanh
  // ─────────────────────────────────────────────
  function setPreset(name) {
    var p = PRESETS[name.toLowerCase()];
    if (!p) {
      console.log("[LocationTracker] Unknown preset: " + name);
      console.log("[LocationTracker] Available: " + Object.keys(PRESETS).join(", "));
      return;
    }
    writeStore("fake_anchor_lat", String(p.latitude));
    writeStore("fake_anchor_lng", String(p.longitude));
    console.log("[LocationTracker] Preset set to " + name + " (" + p.latitude + ", " + p.longitude + ")");
  }

  // ─────────────────────────────────────────────
  // MAIN
  // ─────────────────────────────────────────────
  var fakeAnchor = loadFakeAnchor();
  var realAnchor = loadRealAnchor();

  fetchRealLocation(function (realPos, err) {
    if (!realPos) {
      console.log("[LocationTracker] Failed to get real location: " + err);
      $done({});
      return;
    }

    // Lần đầu chạy: GPS hiện tại trở thành anchor thật
    if (!realAnchor) {
      realAnchor = { latitude: realPos.latitude, longitude: realPos.longitude };
      writeStore("real_anchor_lat", String(realAnchor.latitude));
      writeStore("real_anchor_lng", String(realAnchor.longitude));
      console.log("[LocationTracker] Real anchor set: " + realAnchor.latitude + ", " + realAnchor.longitude);
    }

    var fake = calcFakePosition(
      realPos.latitude,
      realPos.longitude,
      realAnchor,
      fakeAnchor
    );

    // Ghi vào persistentStore — IOS_Location_Spoofer sẽ tự đọc
    writeStore("latitude",  fake.latitude.toFixed(6));
    writeStore("longitude", fake.longitude.toFixed(6));

    console.log(
      "[LocationTracker] Real: " + realPos.latitude.toFixed(4) + ", " + realPos.longitude.toFixed(4) +
      " → Fake: " + fake.latitude.toFixed(4) + ", " + fake.longitude.toFixed(4)
    );

    $done({});
  });

})();
