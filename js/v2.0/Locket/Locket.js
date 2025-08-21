// Locket.js
const version = 'v2.0';
console.log(`[Locket] Script version: ${version}`);

try {
    let body = $response.body;
    console.log("[Locket] Original Response:", body);

    let obj = JSON.parse(body);

    // Tạo object Premium
    const premiumInfo = {
        "grace_period_expires_date": null,
        "purchase_date": "2025-01-01T01:04:17Z",
        "product_identifier": "com.locket02.premium.yearly",
        "expires_date": "2099-12-18T01:04:17Z"
    };

    const subscriptionInfo = {
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "billing_issues_detected_at": null,
        "period_type": "normal",
        "expires_date": "2099-12-18T01:04:17Z",
        "grace_period_expires_date": null,
        "unsubscribe_detected_at": null,
        "original_purchase_date": "2025-01-01T01:04:18Z",
        "purchase_date": "2025-01-01T01:04:17Z",
        "store": "app_store"
    };

    // Chèn dữ liệu Premium
    if (obj.subscriber) {
        obj.subscriber.subscriptions["com.locket02.premium.yearly"] = subscriptionInfo;
        obj.subscriber.entitlements["pro"] = premiumInfo;
        console.log("[Locket] Premium data injected successfully!");
    } else {
        console.log("[Locket] subscriber key not found in response!");
    }

    $done({ body: JSON.stringify(obj) });

} catch (err) {
    console.log("[Locket] Error:", err);
    $done({});
}
