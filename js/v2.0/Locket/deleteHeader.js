const version = 'V2.0';

// Lấy danh sách header từ request
var modifiedHeaders = $request.headers;

// Danh sách các header cần xóa/cập nhật
const headersToModify = [
  "X-RevenueCat-ETag",
  "If-None-Match"
];

// Xóa các header không mong muốn để đảm bảo script được thực thi
headersToModify.forEach(key => {
  if (modifiedHeaders[key]) {
    delete modifiedHeaders[key];
  }
  // Một cách khác, nếu bạn muốn dùng set
  // setHeaderValue(modifiedHeaders, key, "");
});

// Thêm hoặc cập nhật các header cần thiết để bỏ cache
setHeaderValue(modifiedHeaders, "Cache-Control", "no-cache");
setHeaderValue(modifiedHeaders, "Pragma", "no-cache");

// Hàm đặt giá trị header, đã được tinh gọn
function setHeaderValue(headers, key, value) {
    const lowerKey = key.toLowerCase();
    if (headers[lowerKey] !== undefined) {
        headers[lowerKey] = value;
    } else {
        headers[key] = value;
    }
}

// Ghi log để kiểm tra
console.log(`[${version}] Headers đã được tinh chỉnh.`);

// Trả về request với headers đã chỉnh sửa
$done({ headers: modifiedHeaders });
