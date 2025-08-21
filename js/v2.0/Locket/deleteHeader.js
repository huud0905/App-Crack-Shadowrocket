const version = 'v2.0';

// Lấy headers từ request
let modifiedHeaders = $request?.headers || {};

// Chuyển toàn bộ key về lowercase để xử lý dễ hơn
let normalizedHeaders = {};
for (let key in modifiedHeaders) {
  normalizedHeaders[key.toLowerCase()] = modifiedHeaders[key];
}

// Danh sách header cần xóa hoặc chỉnh sửa
const headersToModify = {
  "x-revenuecat-etag": null,   // null = xóa hẳn header
  "if-none-match": null,
  "cache-control": "no-cache",
  "pragma": "no-cache"
};

// Áp dụng thay đổi
for (let key in headersToModify) {
  if (headersToModify[key] === null) {
    delete normalizedHeaders[key]; // Xóa hẳn header
  } else {
    normalizedHeaders[key] = headersToModify[key]; // Gán giá trị mới
  }
}

// Trả lại headers với key gốc như cũ
console.log("🛠 Modified Headers:", JSON.stringify(normalizedHeaders, null, 2));
$done({ headers: normalizedHeaders });
