// Mapping giữa User-Agent và product_id
const mapping = {
  '%E8%BD%A6%E7%A5%A8%E7%A5%A8': 'vip+watch_vip',
  'Locket': 'Gold'
};

// Parse response body
let obj = {};
try {
  obj = JSON.parse($response.body);
} catch (e) {
  $done($response); // Nếu parse lỗi, trả về response gốc
}

// Đảm bảo subscriber, subscriptions, entitlements tồn tại
obj.subscriber = obj.subscriber || {};
obj.subscriber.subscriptions = obj.subscriber.subscriptions || {};
obj.subscriber.entitlements = obj.subscriber.entitlements || {};

// Thêm thông báo
obj.Attention = "Chúc mừng bạn!";

// Tạo dữ liệu subscription và entitlement
const locketData = {
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

const entitlementData = {
  grace_period_expires_date: null,
  purchase_date: "2025-01-01T01:04:17Z",
  product_identifier: "com.locket02.premium.yearly",
  expires_date: "2099-12-18T01:04:17Z"
};

// Lấy User-Agent
const ua = ($request.headers["User-Agent"] || $request.headers["user-agent"] || "").toLowerCase();
const match = Object.keys(mapping).find(key => ua.includes(key.toLowerCase()));

// Xử lý mapping
if (match) {
  const productId = mapping[match];
  entitlementData.product_identifier = productId;
  obj.subscriber.subscriptions[productId] = locketData;
  obj.subscriber.entitlements[productId] = entitlementData;
} else {
  obj.subscriber.subscriptions["com.locket02.premium.yearly"] = locketData;
  obj.subscriber.entitlements["pro"] = entitlementData;
}

// Trả về kết quả
$done({ body: JSON.stringify(obj) });
