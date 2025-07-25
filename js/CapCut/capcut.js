// ==CapCut Pro Unlocker==
// @author AI
// @version 1.0

let body = $response.body;
let url = $request.url;

try {
    let obj = JSON.parse(body);

    if (url.includes("/user/")) {
        // Giả lập tài khoản Pro
        obj.data = {
            ...obj.data,
            "vipStatus": "1",
            "vipExpire": "2099-12-31T23:59:59Z",
            "isPro": true
        };
    }

    if (url.includes("/vip/") || url.includes("/template/") || url.includes("/effect/") || url.includes("/music/")) {
        // Mở khóa VIP, template, nhạc
        if (obj.data) {
            obj.data.forEach(item => {
                item.isVip = false;
                item.vipType = 0;
                item.proOnly = false;
            });
        }
    }

    // Xoá watermark (nếu có)
    if (obj.watermark) {
        obj.watermark.show = false;
        obj.watermark.text = "";
    }

    $done({ body: JSON.stringify(obj) });

} catch (e) {
    console.log("CapCut Unlocker Error: ", e);
    $done({});
}
