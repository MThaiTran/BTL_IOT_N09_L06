// file: virtual-device.js
const mqtt = require('mqtt');

// --- CẤU HÌNH HIVEMQ ---
const CONFIG = {
    host: 'dia-chi-hivemq-cua-ban.s1.eu.hivemq.cloud', // Điền Host của bạn
    port: 8883, // LƯU Ý: Dùng port 8883 cho thiết bị (TCP/TLS)
    protocol: 'mqtts', // 'mqtts' nghĩa là MQTT qua SSL/TLS
    username: '',
    password: 'your-password'
};

// --- KẾT NỐI ---
console.log('🔄 Đang kết nối tới HiveMQ...');
const client = mqtt.connect(CONFIG);

// --- KHI KẾT NỐI THÀNH CÔNG ---
client.on('connect', () => {
    console.log('✅ ESP32 Ảo đã kết nối thành công!');

    // 1. Giả lập việc lắng nghe lệnh điều khiển từ App (Đèn/Quạt)
    client.subscribe('smarthome/controls/fan');
    client.subscribe('smarthome/controls/light');

    // 2. Bắt đầu gửi dữ liệu cảm biến (Loop)
    setInterval(publishSensorData, 5000); // Gửi mỗi 5 giây
});

// --- HÀM GIẢ LẬP GỬI DỮ LIỆU CẢM BIẾN ---
function publishSensorData() {
    // Tạo số ngẫu nhiên để biểu đồ trông sinh động
    const temp = (25 + Math.random() * 5).toFixed(1); // 25.0 - 30.0 độ C
    const hum = Math.floor(60 + Math.random() * 20);  // 60 - 80 %
    const lux = Math.floor(200 + Math.random() * 800); // 200 - 1000 Lux

    const payload = JSON.stringify({
        temp: parseFloat(temp),
        hum: hum,
        lux: lux
    });

    client.publish('smarthome/sensors', payload);
    console.log(`📡 [Gửi đi]: ${payload}`);
}

// --- XỬ LÝ KHI NHẬN LỆNH ĐIỀU KHIỂN ---
client.on('message', (topic, message) => {
    const msgString = message.toString();
    console.log(`📩 [Nhận lệnh] Topic: ${topic} -> Nội dung: ${msgString}`);

    if (topic.includes('fan')) {
        console.log(`   => ${msgString === '1' ? 'BẬT' : 'TẮT'} Quạt`);
    } else if (topic.includes('light')) {
        console.log(`   => ${msgString === '1' ? 'BẬT' : 'TẮT'} Đèn`);
    }
});

client.on('error', (err) => {
    console.error('❌ Lỗi kết nối:', err);
});