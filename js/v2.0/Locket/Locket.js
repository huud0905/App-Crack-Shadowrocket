// Locket.js
if (typeof $response !== 'undefined') {
  let body = $response.body || "{}";
  let obj = JSON.parse(body);

  const unlockData = {
    "expires_date": "2099-12-31T23:59:59Z",
    "purchase_date": "2025-01-01T00:00:00Z",
    "ownership_type": "PURCHASED",
    "store": "app_store"
  };

  // Tạo object nếu chưa có
  obj.subscriber = obj.subscriber || {};
  obj.subscriber.entitlements = obj.subscriber.entitlements || {};
  obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};

  // Set entitlement Premium
  obj.subscriber.entitlements["pro"] = {
    ...unlockData,
    "product_identifier": "com.locket02.premium.yearly"
  };

  // Set subscription Premium
  obj.subscriber.subscriptions["com.locket02.premium.yearly"] = {
    ...unlockData,
    "period_type": "normal"
  };

  console.log("✅ Premium unlocked thành công!");
  $done({ body: JSON.stringify(obj) });
}
