const webPush = require("web-push");

const keys = webPush.generateVAPIDKeys();
console.log("Tambahkan ke .env.local:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
