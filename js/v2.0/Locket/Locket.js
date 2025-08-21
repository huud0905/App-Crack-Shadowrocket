// Locket.js - từ v1.0 gốc, giữ nguyên logic Premium
if (typeof $response !== 'undefined') {
  try {
    var mapping = {
      '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'],
      'Locket': ['Gold']
    };

    var ua = $request.headers["User-Agent"] || $request.headers["user-agent"];
    var obj = JSON.parse($response.body || "{}");

    obj.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";

    var premiumSub = {
      is_sandbox: false,
      ownership_type: "PURCHASED",
      billing_issues_detected_at: null,
      period_type: "normal",
      expires_date: "2099-12-18T01:04:17Z",
      grace_period_expires_date: null,
      unsubscribe_detected_at: null,
      original_purchase_date: "2025-01-01T01:04:18Z",
      purchase_date: "2025-01-01T01:04:17Z",
      store: "app_store"
    };

    var premiumEnt = {
      grace_period_expires_date: null,
      purchase_date: "2025-01-01T01:04:17Z",
      product_identifier: "com.locket02.premium.yearly",
      expires_date: "2099-12-18T01:04:17Z"
    };

    const match = Object.keys(mapping).find(e => ua.includes(e));

    if (match) {
      let [e, s] = mapping[match];
      if (s) {
        premiumEnt.product_identifier = s;
        obj.subscriber.subscriptions[s] = premiumSub;
      } else {
        obj.subscriber.subscriptions["com.locket02.premium.yearly"] = premiumSub;
      }
      obj.subscriber.entitlements[e] = premiumEnt;
    } else {
      obj.subscriber.subscriptions["com.locket02.premium.yearly"] = premiumSub;
      obj.subscriber.entitlements.pro = premiumEnt;
    }

    console.log("[Locket] ✅ Premium data injected!");
    $done({ body: JSON.stringify(obj) });

  } catch (e) {
    console.log("[Locket] ❌ Error:", e);
    $done({});
  }
}
