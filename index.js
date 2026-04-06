const login = require("facebook-chat-api");
const config = require("./config.json");

let isOn = true;
let message = config.message;
let delay = config.delay;
let interval;

function startSending(api) {
    if (interval) clearInterval(interval);

    interval = setInterval(() => {
        if (isOn && config.threadID) {
            api.sendMessage(message, config.threadID);
            console.log("📩 Đã gửi:", message);
        }
    }, delay);
}

login({ email: config.email, password: config.password }, (err, api) => {
    if (err) return console.error("❌ Lỗi login:", err);

    console.log("✅ Bot đã chạy!");

    const ADMIN_ID = "DÁN_UID_VÀO_ĐÂY";

    startSending(api);

    api.listenMqtt((err, msg) => {
        if (err || !msg.body) return;

        // 🔥 lấy UID + threadID
        console.log("UID:", msg.senderID);
        console.log("THREAD:", msg.threadID);

        // 👉 chỉ admin điều khiển
        if (msg.senderID !== ADMIN_ID) return;

        let text = msg.body.toLowerCase();

        if (text === "!on") {
            isOn = true;
            api.sendMessage("✅ Bot ON", msg.threadID);
        }

        if (text === "!off") {
            isOn = false;
            api.sendMessage("🛑 Bot OFF", msg.threadID);
        }

        if (text.startsWith("!msg ")) {
            message = msg.body.slice(5);
            api.sendMessage("✏️ Đã đổi nội dung", msg.threadID);
        }

        if (text.startsWith("!delay ")) {
            delay = parseInt(msg.body.slice(7));
            startSending(api);
            api.sendMessage("⏱ Đã đổi delay", msg.threadID);
        }
    });
});
