import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { devicesAPI, userDevicesAPI } from "../services/api";
import { Device } from "../interfaces/entities.interface";
import { getCurrentUserId, getCurrentUserRole } from "../utils/roles";
import { UserRole } from "../interfaces/enum";
import {
  Mic,
  Square,
  Volume2,
  Info,
  AlertCircle,
  Check,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

type RecognitionStatus = "idle" | "listening";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const commandHints = [
  "Bật đèn phòng khách",
  "Bật quạt phòng bếp",
  "Bật đèn cầu thang",
  "Tắt quạt phòng bếp",
];

// Danh sách vị trí đèn có thể bật/tắt
const lightLocations = [
  "phòng ngủ",
  "cầu thang",
  "phòng khách",
  "phòng bếp",
  "sân",
];

function VoiceControlPage() {
  const userId = getCurrentUserId();
  const userRole = getCurrentUserRole();
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [lastAction, setLastAction] = useState("Chưa có lệnh nào");
  const [isSupported, setIsSupported] = useState(true);
  const [permittedDevices, setPermittedDevices] = useState<Device[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Lấy danh sách thiết bị được cấp quyền (chỉ cho Guest & House Owner)
  const { data: userDevices } = useQuery({
    queryKey: ["userDevices", userId],
    queryFn: () => userDevicesAPI.getOne(userId!).then((res) => res.data),
  });

  // Lấy chi tiết tất cả devices
  const { data: allDevices } = useQuery({
    queryKey: ["devices"],
    queryFn: () => devicesAPI.getAll().then((res) => res.data),
  });

  // Filter devices được cấp quyền
  useEffect(() => {
    if (userDevices && allDevices) {
      // Guest/House Owner: chỉ xem thiết bị được cấp (không phải cảm biến)
      const userDeviceIds = userDevices.map((ud: any) => ud.deviceId);
      const permitted = allDevices.filter((d) => userDeviceIds.includes(d.id));
      setPermittedDevices(permitted);
      setIsLoadingPermissions(false);
    }
  }, [userDevices, allDevices, userRole]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        const action = parseCommand(text);
        setLastAction(action);
        toast.success(action);
      };

      recognition.onerror = () => {
        toast.error("Có lỗi khi nhận dạng giọng nói");
        setStatus("idle");
      };

      recognition.onend = () => {
        setStatus("idle");
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Tìm thiết bị dựa trên tên và vị trí
  const findDevice = (
    deviceType: "light" | "fan",
    location?: string
  ): Device | null => {
    console.log("Finding device:", location);
    console.log("Permitted devices:", permittedDevices);
    if (!location || location === null || location === undefined) return null;

    if (deviceType === "light") {
      // Đèn: tìm theo vị trí
      if (location) {
        return (
          permittedDevices.find(
            (d) =>
              d.location?.toLowerCase().includes(location.toLowerCase()) &&
              d.name?.toLowerCase().includes("đèn")
          ) || null
        );
      }
    } else if (deviceType === "fan") {
      // Quạt: tìm theo vị trí
      if (location) {
        return (
          permittedDevices.find(
            (d) =>
              d.location?.toLowerCase().includes(location.toLowerCase()) &&
              d.name?.toLowerCase().includes("quạt")
          ) || null
        );
      }
    }

    return null;
  };

  // Trích xuất vị trí từ lệnh giọng nói
  const extractLocation = (text: string): string | null => {
    const lower = text.toLowerCase();
    for (const location of lightLocations) {
      if (lower.includes(location)) {
        return location;
      }
    }
    return null;
  };

  const parseCommand = (text: string): string => {
    const lower = text.toLowerCase();
    const location = extractLocation(text);

    // Xử lý lệnh bật đèn
    if (lower.includes("bật") && lower.includes("đèn")) {
      const lightDevice = findDevice("light", location || undefined);
      if (!lightDevice) {
        return `Không tìm thấy đèn ở VT:${location} || ${lightDevice}hoặc bạn không có quyền điều khiển`;
      } else {
        devicesAPI.update(lightDevice.id, {
          state: true,
          autoMode: lightDevice.autoMode,
        });
      }
      return `Đã bật đèn ${lightDevice.location} thành công`;
    }

    // Xử lý lệnh tắt đèn
    if (lower.includes("tắt") && lower.includes("đèn")) {
      const lightDevice = findDevice("light", location || undefined);
      if (!lightDevice) {
        return `Không tìm thấy đèn ở ${location} hoặc bạn không có quyền điều khiển`;
      } else {
        devicesAPI.update(lightDevice.id, {
          state: false,
          autoMode: lightDevice.autoMode,
        });
      }
      return `Đã tắt đèn ${lightDevice.location} thành công`;
    }

    // Xử lý lệnh bật quạt
    if (lower.includes("bật") && lower.includes("quạt")) {
      const fanDevice = findDevice("fan", location || undefined);
      if (!fanDevice) {
        return `Không tìm thấy quạt ở ${location} hoặc bạn không có quyền điều khiển`;
      } else {
        devicesAPI.update(fanDevice.id, {
          state: true,
          autoMode: fanDevice.autoMode,
        });
      }
      return `Đã bật quạt ${fanDevice.location} thành công`;
    }

    // Xử lý lệnh tắt quạt
    if (lower.includes("tắt") && lower.includes("quạt")) {
      const fanDevice = findDevice("fan", location || undefined);
      if (!fanDevice) {
        return `Không tìm thấy quạt ở ${location} hoặc bạn không có quyền điều khiển`;
      } else {
        devicesAPI.update(fanDevice.id, {
          state: false,
          autoMode: fanDevice.autoMode,
        });
      }
      return `Đã tắt quạt ${fanDevice.location} thành công`;
    }

    // Xử lý lệnh tăng tốc độ quạt
    if (
      lower.includes("tăng") &&
      (lower.includes("quạt") || lower.includes("tốc"))
    ) {
      const fanDevice = findDevice("fan", location || undefined);
      if (!fanDevice) {
        return "Không tìm thấy quạt hoặc bạn không có quyền điều khiển";
      }
      return `Đã tăng tốc độ quạt ${fanDevice.location}`;
    }

    // Xử lý lệnh giảm tốc độ quạt
    if (
      lower.includes("giảm") &&
      (lower.includes("quạt") || lower.includes("tốc"))
    ) {
      const fanDevice = findDevice("fan", location || undefined);
      if (!fanDevice) {
        return "Không tìm thấy quạt hoặc bạn không có quyền điều khiển";
      }
      return `Đã giảm tốc độ quạt ${fanDevice.location}`;
    }

    // Xử lý lệnh điều chỉnh nhiệt độ
    if (
      lower.includes("giảm") &&
      (lower.includes("nhiệt") || lower.includes("độ"))
    ) {
      return "Đã giảm nhiệt độ về mức an toàn";
    }

    if (
      lower.includes("tăng") &&
      (lower.includes("nhiệt") || lower.includes("độ"))
    ) {
      return "Đã tăng nhiệt độ theo yêu cầu";
    }

    return "Không nhận diện được lệnh, vui lòng thử lại";
  };

  const handleStart = () => {
    if (!recognitionRef.current) {
      toast.error("Trình duyệt của bạn không hỗ trợ điều khiển bằng giọng nói");
      return;
    }
    setStatus("listening");
    setTranscript("");
    recognitionRef.current.start();
  };

  const handleStop = () => {
    recognitionRef.current?.stop();
    setStatus("idle");
  };

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Điều khiển bằng giọng nói
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ra lệnh cho thiết bị thông minh bằng tiếng Việt thời gian thực
          </p>
        </div>
      </div>

      {!isSupported && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm text-yellow-700 dark:text-yellow-200 flex items-center gap-2">
          <Info size={18} />
          Trình duyệt hiện tại không hỗ trợ Web Speech API. Vui lòng sử dụng
          Chrome hoặc Edge mới nhất.
        </div>
      )}

      {/* Thông báo cho Guest không có quyền */}
      {(userRole === UserRole.GUEST || userRole === UserRole.HOUSE_OWNER) &&
        permittedDevices.length === 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">
                  Không có thiết bị để điều khiển
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  Bạn chưa được cấp quyền điều khiển bất kỳ thiết bị nào. Vui
                  lòng liên hệ quản trị viên.
                </p>
              </div>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {status === "listening" ? "Đang lắng nghe..." : "Sẵn sàng"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                disabled={
                  !isSupported ||
                  status === "listening" ||
                  permittedDevices.length === 0
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Mic size={18} />
                Bắt đầu
              </button>
              <button
                onClick={handleStop}
                disabled={status === "idle"}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Square size={18} />
                Dừng
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Lệnh vừa nói</p>
            <div className="min-h-[70px] p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-gray-200">
              {transcript || "---"}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Hành động hệ thống</p>
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-700 dark:text-primary-300">
              {lastAction}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="text-primary-600" size={22} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {userRole === UserRole.ADMIN
                ? "Lệnh gợi ý"
                : "Thiết bị có thể điều khiển"}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {userRole === UserRole.ADMIN
              ? "Thử các câu lệnh mẫu sau để điều khiển thiết bị:"
              : "Bạn có thể điều khiển các thiết bị sau:"}
          </p>
          <ul className="space-y-3 max-h-[400px] overflow-y-auto">
            {userRole === UserRole.ADMIN ? (
              commandHints.map((hint) => (
                <li
                  key={hint}
                  className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm"
                >
                  '"{hint}"'
                </li>
              ))
            ) : permittedDevices.length > 0 ? (
              permittedDevices.map((device) => (
                <li
                  key={device.id}
                  className="px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Check size={16} />
                    <p className="font-semibold">{device.name}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-6 text-xs opacity-75">
                    <MapPin size={12} />
                    {device.location}
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm">
                Chưa có thiết bị nào
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VoiceControlPage;
