# (Nháp) Các topic mà backend và ESP32 cần giao tiếp với nhau

> Lưu ý: Hiện tại thiết bị ESP32 sẽ chưa gửi QoS khác 0, với lý do là cần chỉnh sửa thêm code và thêm thư viện khác, đây sẽ là tính năng ưu tiên thấp.

Các topic và mục đích
## `/esp32/pubStatus`
- Do ESP32 gửi đến backend
- QoS: 0
- Mục đích: gửi số liệu các sensor và trạng thái hoạt điều khiển tới backend, nhằm cung cấp người dùng trạng thái theo thời gian thực.
- ESP32 sẽ gửi thông tin dưới dạng JSON như sau:

```
{
  "sensors": {
    "temp": 27.5,
    "hum": 51.5,
    "motion": false
  },
  "devices": [
    { "id": 8, "state": false, "autoMode": false },
    { "id": 9, "state": false, "autoMode": false },
    { "id": 10, "state": false, "autoMode": false },
    { "id": 11, "state": false, "autoMode": false },
    { "id": 12, "state": false, "autoMode": false },
    { "id": 13, "state": false, "autoMode": false }
  ]
}
// Add status: "active"/ "inactive" - Dùng cho trạng thái online/ offline <= Đang suy nghĩ thêm
```

## `esp32/subDevices`
- Do backend gửi đến ESP32
- QoS: 2
- Mục đích: 
  - Điều khiển thủ công: gửi yêu cầu điều khiển trực tiếp đến ESP, ra lệnh điều khiển cho nó.
  - Điều khiển tự động: thay vì gửi lệnh, gửi ngưỡng kích hoạt theo các trường có sẵn, khi đó thiết bị sẽ tự động điều khiển thiết bị nếu điều kiện ngưỡng được thoả mãn.

- Ở trường hợp để ESP điều khiển thiết bị tự động, ESP32 mong đọc được id thiết bị, cùng ít nhất 1 ngưỡng dưới dạng JSON như sau:
```
{
  "id": 9,
  "tempHigher": 35,
  "motionOn": true
}
// Expected JSON:
id
min(1,6 truong)
state
status
autoMode
```
- Lúc này, ESP sẽ thiết lập các ngưỡng như yêu cầu, các ngưỡng mà không được chỉ định đều sẽ được bỏ qua, ESP32 lưu giá trị biến là `NAN`.

- Ở trường hợp điều khiển thủ công, ESP32 sẽ mong được đọc thông tin dưới dạng JSON như sau:

```
{
  "id": 9,
  "state": true // yêu cầu bật thiết bị
}
```
- Lúc này, ESP sẽ chuyển từ chế độ điều khiển thiết bị đó từ tự động sang thủ công hoàn toàn, và reset - để `NAN` - xoá các giá trị điều khiển tự động cho thiết bị đó.

Các tên ngưỡng mà ESP có thể đọc được:
- `tempHigher` - (float) kích hoạt thiết bị khi nhiệt độ vượt ngưỡng chỉ định
- `tempLower` - (float) kích hoạt thiết bị khi nhiệt độ dưới ngưỡng được chỉ định
- `humHigher` - (float) kích hoạt thiết bị khi độ ẩm vượt ngưỡng chỉ định
- `humLower` - (float) kích hoạt thiết bị khi độ ẩm dưới ngưỡng chỉ định
- `motionOn` - (bool) kích hoạt thiết bị khi phát hiện chuyển động
- `motionOff` - (bool) kích hoạt thiết bị khi không phát hiện chuyển động


## `esp32/pubLogs`
- Do ESP32 gửi đến backend
- QoS: 1
- Để tiện cho mục đích log dữ liệu, ESP ngoài việc gửi bản ghi mỗi vài giây để hiển thị trạng thái thiết bị theo thời gian thực, sẽ còn gửi một bản ghi tổng hợp mỗi vài phút, lưu trạng thái và các thiết bị.
- Riêng các thay đổi về hoạt động bật tắt thiết bị, sẽ yêu cầu log dữ liệu hiện tại ngay lập tức
```
{
  "sensors": {
    "temp": 27.5,
    "hum": 51.5,
    "motion": false
  },
  "devices": [
    { "id": 8, "state": false, "autoMode": false },
    { "id": 9, "state": false, "autoMode": false },
    { "id": 10, "state": false, "autoMode": false },
    { "id": 11, "state": false, "autoMode": false },
    { "id": 12, "state": false, "autoMode": false },
    { "id": 13, "state": false, "autoMode": false }
  ]
}
// Add status....
```

## `esp32/pubWarnings`
- Do ESP32 gửi đến backend
- QoS: 2
- Trong trường hợp có ít nhất 1 thiết bị được thiết lập điều khiển tự động theo ngưỡng đã đặt, ESP sẽ gửi thông báo đến backend nếu điều kiện hoạt động thiết bị vượt quá ngưỡng đã thiết lập.
```
{ 
  "id": 9, 
  "threshold": "tempHigher",
  "thresholdValue": 25,
  "value": 27
}
```

## `esp32/availability`
- Do ESP32 gửi đến backend ngay khi thiết lập kết nối tới MQTT.
- QoS: 1
- Nếu thiết bị offline trong trường hợp bất ngờ (mất mạng, mất điện, etc..), MQTT broker sẽ dựa vào di chúc đính kèm ở yêu cầu kết nối ban đầu, để gửi thông báo đến các client là đã mất kết nối
- Respond của topic này cũng sẽ là JSON (biết là không cần phải là JSON, chỉ là để đồng bộ mấy cái kia thôi)
```
{ availability: false } // false = đã ngắt kết nối
```


# Test cases
- Bật một thiết bị
```
{
  "id": 10,
  "state": true
}
```

- Tắt một thiết bị
```
{
  "id": 10,
  "state": true
}
```

- Đặt điều kiện: nóng hơn bao nhiêu độ
```
{
  "id": 13,
  "autoMode": true,
  "tempHigher": 29
}
```

- Đặt điều kiện: có chuyển động
```
{
  "id": 12,
  "autoMode": true,
  "tempHigher": 28
}
```

- Đặt điều kiện: độ ẩm cao hơn bao nhiêu % hoặc nhiệt độ cao hơn bao nhiêu
```
{
  "id": 11,
  "autoMode": true,
  "tempHigher": 35,
  "hum"
}
```
{ "availability": false } // false = đã ngắt kết nối
```
