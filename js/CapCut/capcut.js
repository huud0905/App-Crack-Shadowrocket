// capcut_plus.js

if ($request.url.includes("/user/info") || $request.url.includes("/vip/info")) {
  let obj = JSON.parse($response.body);

  // Giả lập tài khoản VIP
  obj.user = obj.user || {};
  obj.user.vipInfo = {
    vipType: "PRO",
    vipLevel: 3,
    expireTime: 4070880000, // năm 2099
    status: 1
  };

  obj.isVip = true;

  $done({ body: JSON.stringify(obj) });
} else if ($request.url.includes("/watermark/info")) {
  // Vô hiệu watermark
  let obj = JSON.parse($response.body);
  obj.show_watermark = false;
  obj.watermark = null;
  $done({ body: JSON.stringify(obj) });
} else if ($request.url.includes("/template/info") || $request.url.includes("/effect/list")) {
  // Mở tất cả template & hiệu ứng Pro (nếu có thể)
  let obj = JSON.parse($response.body);
  if (obj?.data) {
    for (let item of obj.data) {
      item.is_pro = false;
      item.vip_required = false;
    }
  }
  $done({ body: JSON.stringify(obj) });
} else {
  $done({});
}
