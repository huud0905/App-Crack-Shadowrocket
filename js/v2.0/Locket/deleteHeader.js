// DeleteHeader.js
const version = 'v2.0';
console.log(`[DeleteHeader] Script version: ${version}`);

try {
    let headers = $request.headers;
    console.log("[DeleteHeader] Original Headers:", JSON.stringify(headers, null, 2));

    // Danh sách header cần xóa/cập nhật
    const headersToModify = {
        "X-RevenueCat-ETag": "",
        "If-None-Match": "",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    };

    // Hàm sửa header
    function setHeaderValue(headers, key, value) {
        const lowerKey = key.toLowerCase();
        if (lowerKey in headers) {
            headers[lowerKey] = value;
        } else {
            headers[key] = value;
        }
    }

    for (let key in headersToModify) {
        setHeaderValue(headers, key, headersToModify[key]);
    }

    console.log("[DeleteHeader] Modified Headers:", JSON.stringify(headers, null, 2));
    $done({ headers });

} catch (err) {
    console.log("[DeleteHeader] Error:", err);
    $done({});
}
