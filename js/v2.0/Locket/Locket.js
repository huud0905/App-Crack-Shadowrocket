const mapping = {
  'Locket': ['Gold']
};

const userAgent = $request.headers["User-Agent"] || $request.headers["user-agent"];
let responseBody = JSON.parse($response.body);

// Thông tin gói đăng ký Premium
const premiumSubscription = {
  is_sandbox: false,
  ownership_type: "PURCHASED",
  period_type: "normal",
  expires_date: "2099-12-18T01:04:17Z",
  original_purchase_date: "2025-01-02T01:04:18Z", // Đã sửa thành ngày 2/1/2025
  purchase_date: "2025-01-02T01:04:17Z", // Đã sửa thành ngày 2/1/2025
  store: "app_store"
};

// Thông tin quyền lợi
const entitlementInfo = {
  purchase_date: "2025-01-02T01:04:17Z", // Đã sửa thành ngày 2/1/2025
  product_identifier: "com.ohoang7.premium.yearly",
  expires_date: "2099-12-18T01:04:17Z"
};

const match = Object.keys(mapping).find(key => userAgent.includes(key));

if (match) {
  const entitlementName = mapping[match][0];
  entitlementInfo.product_identifier = `com.huud.app.${entitlementName.toLowerCase()}`;
  responseBody.subscriber.subscriptions[entitlementInfo.product_identifier] = premiumSubscription;
  responseBody.subscriber.entitlements[entitlementName] = entitlementInfo;
} else {
  // Trường hợp không khớp mapping, áp dụng cho gói mặc định
  responseBody.subscriber.subscriptions["com.ohoang7.premium.yearly"] = premiumSubscription;
  responseBody.subscriber.entitlements.pro = entitlementInfo;
}

// Thêm thông báo tùy chỉnh
responseBody.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";

$done({body: JSON.stringify(responseBody)});
