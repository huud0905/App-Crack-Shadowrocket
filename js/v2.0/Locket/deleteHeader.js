// DeleteHeader.js - từ v1.0 gốc, chỉ xóa header
if (typeof $request !== 'undefined') {
  let headers = $request.headers || {};
  console.log("[DeleteHeader] Original Headers:", JSON.stringify(headers, null, 2));

  let target = ["x-revenuecat-etag", "if-none-match", "cache-control", "pragma"];
  for (let k of target) {
    let key = Object.keys(headers).find(h => h.toLowerCase() === k);
    if (key) {
      delete headers[key];
      console.log(`[DeleteHeader] Removed header: ${key}`);
    }
  }

  $done({ headers });
}
