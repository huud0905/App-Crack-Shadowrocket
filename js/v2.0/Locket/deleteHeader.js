// deleteHeader.js
if (typeof $request !== 'undefined') {
  let headers = $request.headers || {};
  let target = ["x-revenuecat-etag", "if-none-match", "cache-control", "pragma"];

  for (let k of target) {
    let key = Object.keys(headers).find(h => h.toLowerCase() === k);
    if (key) delete headers[key];
  }

  console.log("🛠 Headers sau khi xoá:", JSON.stringify(headers, null, 2));
  $done({ headers });
}
