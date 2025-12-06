# (Nháp) Các topic mà backend và ESP32 cần giao tiếp với nhau

Các topic và mục đích
## `/esp32/pubStatus`
- Do ESP32 gửi đến backend
- QoS: 0
- Mục đích: gửi số liệu các sensor và trạng thái hoạt điều khiển tới backend, nhằm cung cấp người dùng trạng thái theo thời gian thực
- ESP32 sẽ gửi thông tin dưới dạng JSON như sau:

```
{
  "sensors": {
    "temp": 27.5,
    "hum": 51.5,
    "motion": false
  },
  "devices": [
    { "id": 8, "state": false },
    { "id": 9, "state": false },
    { "id": 10, "state": false },
    { "id": 11, "state": false },
    { "id": 12, "state": false },
    { "id": 13, "state": false }
  ]
}
```

## `esp32/subDevices`
- Do backend gửi đến ESP32
- QoS: 2
- Mục đích: 
  - Điều khiển thủ công: gửi yêu cầu điều khiển trực tiếp đến ESP, ra lệnh điều khiển cho nó
  - Điều khiển tự động: thay vì gửi lệnh, gửi ngưỡng kích hoạt theo các trường có sẵn, khi đó thiết bị sẽ tự động điều khiển thiết bị nếu điều kiện ngưỡng được thoả mãn

- Ở trường hợp để ESP điều khiển thiết bị tự động, ESP32 mong đọc được id thiết bị, cùng ít nhất 1 ngưỡng dưới dạng JSON như sau:
```
{
  "id": 9,
  "tempHigher": 35,
  "motionOn": true
}
```
- Lúc này, ESP sẽ thiết lập các ngưỡng như yêu cầu, các ngưỡng mà không được chỉ định đều sẽ được bỏ qua, ESP32 lưu giá trị biến là `NAN`.

- Ở trường hợp điều khiển thủ công, ESP32 sẽ mong được đọc thông tin dưới dạng JSON như sau:

```
{
  "id": 9,
  "state": true // yêu cầu bật thiết bị
}
```
- Lúc này, hệ thống sẽ chuyển từ chế độ tự động sang thủ công hoàn toàn, và reset - để `NAN` cho tất cả giá trị điều khiển tự động

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
    { "id": 8, "state": false },
    { "id": 9, "state": false },
    { "id": 10, "state": false },
    { "id": 11, "state": false },
    { "id": 12, "state": false },
    { "id": 13, "state": false }
  ]
}
```

## `esp32/pubWarnings`
- Do ESP32 gửi đến backend
- QoS: 2
- Trong trường hợp có ít nhất 1 thiết bị được thiết lập điều khiển tự động theo ngưỡng đã đặt, ESP sẽ gửi thông báo đến backend nếu điều kiện hoạt động thiết bị vượt quá ngưỡng đã thiết lập
```
{ 
  "id": 9, 
  "threshold": "tempHigher",
  "thresholdValue": 25,
  "temp": 27.5,
}
```