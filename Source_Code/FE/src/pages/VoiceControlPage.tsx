import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { devicesAPI, userDevicesAPI } from '../services/api';
import { Device } from '../interfaces/entities.interface';
import { getCurrentUserId, getCurrentUserRole } from '../utils/roles';
import { UserRole } from '../interfaces/enum';
import { Mic, Square, Volume2, Info, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

type RecognitionStatus = 'idle' | 'listening' | 'processing';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const commandHints = [
  'Bật đèn phòng khách',
  'Tắt quạt phòng ngủ',

];

function VoiceControlPage() {
  const userId = getCurrentUserId();
  const userRole = getCurrentUserRole();
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState('Chưa có lệnh nào');
  const [isSupported, setIsSupported] = useState(true);
  const [permittedDevices, setPermittedDevices] = useState<Device[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const recognitionRef = useRef<any>(null);

  // ✅ Mutation gọi devicesAPI.update(deviceId, { state })
  const updateDeviceMutation = useMutation({
    mutationFn: async ({
      deviceId,
      state,
      deviceName,
      location,
    }: {
      deviceId: number;
      state: boolean;
      deviceName: string;
      location: string;
    }) => {
      console.log(
        `🚀 [DỰA VÀO COMMAND] Gọi devicesAPI.update(${deviceId}, { state: ${state} })`
      );
      // ✅ FIX: Truyền đầy đủ các field cần thiết
      const response = await devicesAPI.update(deviceId, { 
        state,
        name: deviceName,
        location: location,
        autoMode: false,
        thresholdHigh: 0,
        thresholdLow: 0,
      });
      console.log('response: ', response);
      return { ...response, deviceName, location };
    },
    onSuccess: (data, variables) => {
      const { deviceName, location, state } = variables;
      const action = state ? 'bật' : 'tắt';
      const message = `✅ Đã ${action} ${deviceName} (${location})`;
      setLastAction(message);
      toast.success(message);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || 'Lỗi';
      setLastAction(`❌ ${errorMsg}`);
      toast.error(errorMsg);
    },
  });

  // Lấy danh sách thiết bị được cấp quyền
  const { data: userDevices } = useQuery({
    queryKey: ['userDevices', userId],
    queryFn: () => userDevicesAPI.getOne(userId!).then((res) => res.data),
    enabled:
      !!userId &&
      (userRole === UserRole.GUEST || userRole === UserRole.HOUSE_OWNER),
  });

  // Lấy chi tiết tất cả devices
  const { data: allDevices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => devicesAPI.getAll().then((res) => res.data),
  });

  // Filter devices được cấp quyền
  useEffect(() => {
    if (!allDevices) {
      console.log('⏳ allDevices chưa load');
      return;
    }

    if (userRole === UserRole.ADMIN) {
      console.log('👤 ADMIN: Lấy tất cả devices (không phải cảm biến)');
      const controlDevices = allDevices.filter(
        (d) => !d.name?.toLowerCase().includes('cảm biến')
      );
      console.log(`✅ Tìm được ${controlDevices.length} devices cho Admin`);
      controlDevices.forEach((d) => console.log(`   [ID=${d.id}] ${d.name} (${d.location})`));
      
      setPermittedDevices(controlDevices);
      setIsLoadingPermissions(false);
    } else if (userRole === UserRole.GUEST || userRole === UserRole.HOUSE_OWNER) {
      if (!userDevices || userDevices.length === 0) {
        console.log('⏳ userDevices chưa load');
        return;
      }

      console.log(`👤 ${userRole}: Lấy devices được cấp`);
      const userDeviceIds = userDevices.map((ud: any) => ud.deviceId);
      console.log(`   Danh sách device IDs được cấp: [${userDeviceIds.join(',')}]`);

      const permitted = allDevices.filter(
        (d) =>
          userDeviceIds.includes(d.id) &&
          !d.name?.toLowerCase().includes('cảm biến')
      );
      console.log(`✅ Tìm được ${permitted.length} devices`);
      permitted.forEach((d) => console.log(`   [ID=${d.id}] ${d.name} (${d.location})`));

      setPermittedDevices(permitted);
      setIsLoadingPermissions(false);
    }
  }, [userDevices, allDevices, userRole]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      // ✅ SỬA: Thêm async và gọi devicesAPI.update()
      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setStatus('processing');

        // ✅ Xử lý lệnh và gọi API
        await executeCommand(text);

        setStatus('idle');
      };

      recognition.onerror = (event: any) => {
        const errorCode = event.error;
        const errorMessages: Record<string, string> = {
          'no-speech': '⏱️ Không phát hiện tiếng nói. Vui lòng thử lại.',
          'audio-capture': '🎤 Không thể truy cập microphone. Kiểm tra quyền truy cập.',
          'network': '🌐 Lỗi kết nối mạng. Kiểm tra internet.',
          'not-allowed': '🔐 Trình duyệt từ chối quyền truy cập microphone.',
          'service-not-allowed': '❌ Dịch vụ nhận dạng giọng nói bị vô hiệu hóa.',
          'bad-grammar': '📝 Lỗi cấu hình nhận dạng.',
          'network-timeout': '⏱️ Hết thời gian chờ kết nối.',
          'permission-denied': '🔒 Quyền microphone bị từ chối.',
        };

        const errorMsg =
          errorMessages[errorCode] ||
          `❌ Lỗi nhận dạng: ${errorCode || 'Không xác định'}`;

        console.error(`🔴 [SpeechRecognition Error] Code: ${errorCode}`);
        console.error(`   Message: ${errorMsg}`);

        setLastAction(errorMsg);
        toast.error(errorMsg);
        setStatus('idle');
      };

      recognition.onend = () => {
        console.log('✅ [SpeechRecognition] Kết thúc');
        setStatus('idle');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // ✅ Tìm device dựa vào loại + vị trí
  const findDevice = (
    deviceType: 'light' | 'fan' | 'đèn' | 'quạt',
    location?: string
  ): Device | null => {
    console.log(`\n🔍 [findDevice] Tìm: type=${deviceType}, location=${location || 'không xác định'}`);
    console.log(`   permittedDevices.length = ${permittedDevices.length}`);
    
    if (deviceType === 'light' || deviceType === 'đèn') {
      console.log(`   📍 Loại: ĐÈN`);
      
      if (location) {
        console.log(`   🎯 Tìm đèn ở vị trí: "${location}"`);
        console.log(`   Duyệt danh sách:`);
        
        permittedDevices.forEach((d) => {
          const locationMatch = d.location?.toLowerCase().includes(location.toLowerCase());
          const nameMatch = d.name?.toLowerCase().includes('đèn');
          const fullMatch = locationMatch && nameMatch;
          
          console.log(
            `     [ID=${d.id}] ${d.name} (${d.location})` +
            `\n       - location.includes('${location}'): ${locationMatch}` +
            `\n       - name.includes('đèn'): ${nameMatch}` +
            `\n       - MATCH: ${fullMatch ? '✅' : '❌'}`
          );
        });
        
        const result = permittedDevices.find(
          (d) =>
            d.location?.toLowerCase().includes(location.toLowerCase()) &&
            d.name?.toLowerCase().includes('đèn')
        ) || null;
        
        console.log(`   ✨ Kết quả: ${result ? `[ID=${result.id}] ${result.name}` : 'NULL'}`);
        return result;
      }
      
      console.log(`   🎯 Tìm đèn (không xác định vị trí)`);
      const result =
        permittedDevices.find((d) => d.name?.toLowerCase().includes('đèn')) ||
        null;
      
      console.log(`   ✨ Kết quả: ${result ? `[ID=${result.id}] ${result.name}` : 'NULL'}`);
      return result;
    } else if (deviceType === 'fan' || deviceType === 'quạt') {
      console.log(`   📍 Loại: QUẠT`);
      
      if (location) {
        console.log(`   🎯 Tìm quạt ở vị trí: "${location}"`);
        console.log(`   Duyệt danh sách:`);
        
        permittedDevices.forEach((d) => {
          const locationMatch = d.location?.toLowerCase().includes(location.toLowerCase());
          const nameMatch = d.name?.toLowerCase().includes('quạt');
          const fullMatch = locationMatch && nameMatch;
          
          console.log(
            `     [ID=${d.id}] ${d.name} (${d.location})` +
            `\n       - location.includes('${location}'): ${locationMatch}` +
            `\n       - name.includes('quạt'): ${nameMatch}` +
            `\n       - MATCH: ${fullMatch ? '✅' : '❌'}`
          );
        });
        
        const result = permittedDevices.find(
          (d) =>
            d.location?.toLowerCase().includes(location.toLowerCase()) &&
            d.name?.toLowerCase().includes('quạt')
        ) || null;
        
        console.log(`   ✨ Kết quả: ${result ? `[ID=${result.id}] ${result.name}` : 'NULL'}`);
        return result;
      }
      
      console.log(`   🎯 Tìm quạt (không xác định vị trí)`);
      const result =
        permittedDevices.find((d) => d.name?.toLowerCase().includes('quạt')) ||
        null;
      
      console.log(`   ✨ Kết quả: ${result ? `[ID=${result.id}] ${result.name}` : 'NULL'}`);
      return result;
    }
    
    console.log(`   ❌ Loại thiết bị không hợp lệ`);
    return null;
  };

  // ✅ Trích xuất vị trí từ command
  const extractLocation = (text: string): string | null => {
    const lightLocations = ['phòng ngủ', 'cầu thang', 'phòng khách', 'phòng bếp', 'sân'];
    const lower = text.toLowerCase().trim();  // ✅ Thêm trim()
    
    console.log(`🔍 [extractLocation] Text: "${text}" → lowercase: "${lower}"`);
    
    for (const location of lightLocations) {
      if (lower.includes(location)) {
        console.log(`✅ Tìm thấy location: "${location}"`);
        return location;
      }
    }
    
    console.log(`❌ Không tìm thấy location nào. Các location hợp lệ: ${lightLocations.join(', ')}`);
    return null;
  };

  // ✅ Sửa executeCommand
  const executeCommand = async (text: string): Promise<void> => {
    const lower = text.toLowerCase();
    const location = extractLocation(text);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 [executeCommand] Location trích xuất: ${location || 'NULL'}`);
    console.log(`📱 permittedDevices hiện có: ${permittedDevices.length} thiết bị`);
    permittedDevices.forEach((d) => 
      console.log(`   [ID=${d.id}] ${d.name} (${d.location})`)
    );
    console.log(`${'='.repeat(60)}\n`);

    // Lệnh: BẬT ĐÈN
    if (lower.includes('bật') && lower.includes('đèn')) {
      // ✅ KIỂM TRA: Không có location
      if (!location) {
        const errorMsg = '❌ Chưa xác định vị trí. Vui lòng nói rõ: phòng ngủ, cầu thang, phòng khách, phòng bếp hoặc sân';
        console.log(`❌ [BẬT ĐÈN] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`🔎 [BẬT ĐÈN] Tìm device với location: "${location}"`);
      
      const device = findDevice('đèn', location);
      
      console.log(`🎯 Kết quả findDevice: ${device ? `[ID=${device.id}] ${device.name}` : 'NULL'}`);
      
      if (!device) {
        const availableLights = permittedDevices
          .filter((d) => d.name?.toLowerCase().includes('đèn'))
          .map((d) => d.location)
          .join(', ');
        
        const errorMsg = `❌ Không có đèn tại ${location}. Các vị trí có đèn: ${availableLights || 'không có'}`;
        console.log(`❌ [BẬT ĐÈN] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      console.log(`✅ [BẬT ĐÈN] Tìm thấy device [ID=${device.id}] - Gọi API...`);
      await updateDeviceMutation.mutateAsync({
        deviceId: device.id,
        state: true,
        deviceName: device.name,
        location: device.location || '',
      });
      return;
    }

    // Lệnh: TẮT ĐÈN
    if (lower.includes('tắt') && lower.includes('đèn')) {
      // ✅ KIỂM TRA: Không có location
      if (!location) {
        const errorMsg = '❌ Chưa xác định vị trí. Vui lòng nói rõ: phòng ngủ, cầu thang, phòng khách, phòng bếp hoặc sân';
        console.log(`❌ [TẮT ĐÈN] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`🔎 [TẮT ĐÈN] Tìm device với location: "${location}"`);
      
      const device = findDevice('đèn', location);
      
      if (!device) {
        const availableLights = permittedDevices
          .filter((d) => d.name?.toLowerCase().includes('đèn'))
          .map((d) => d.location)
          .join(', ');
        
        const errorMsg = `❌ Không có đèn tại ${location}. Các vị trí có đèn: ${availableLights || 'không có'}`;
        console.log(`❌ [TẮT ĐÈN] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`✅ [TẮT ĐÈN] Tìm thấy device [ID=${device.id}] - Gọi API...`);
      await updateDeviceMutation.mutateAsync({
        deviceId: device.id,
        state: false,
        deviceName: device.name,
        location: device.location || '',
      });
      return;
    }

    // Lệnh: BẬT QUẠT
    if (lower.includes('bật') && lower.includes('quạt')) {
      // ✅ KIỂM TRA: Không có location
      if (!location) {
        const errorMsg = '❌ Chưa xác định vị trí. Vui lòng nói rõ: phòng ngủ, cầu thang, phòng khách, phòng bếp hoặc sân';
        console.log(`❌ [BẬT QUẠT] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`🔎 [BẬT QUẠT] Tìm device với location: "${location}"`);
      
      const device = findDevice('quạt', location);
      
      if (!device) {
        const availableFans = permittedDevices
          .filter((d) => d.name?.toLowerCase().includes('quạt'))
          .map((d) => d.location)
          .join(', ');
        
        const errorMsg = `❌ Không có quạt tại ${location}. Các vị trí có quạt: ${availableFans || 'không có'}`;
        console.log(`❌ [BẬT QUẠT] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`✅ [BẬT QUẠT] Tìm thấy device [ID=${device.id}] - Gọi API...`);
      await updateDeviceMutation.mutateAsync({
        deviceId: device.id,
        state: true,
        deviceName: device.name,
        location: device.location || '',
      });
      return;
    }

    // Lệnh: TẮT QUẠT
    if (lower.includes('tắt') && lower.includes('quạt')) {
      // ✅ KIỂM TRA: Không có location
      if (!location) {
        const errorMsg = '❌ Chưa xác định vị trí. Vui lòng nói rõ: phòng ngủ, cầu thang, phòng khách, phòng bếp hoặc sân';
        console.log(`❌ [TẮT QUẠT] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`🔎 [TẮT QUẠT] Tìm device với location: "${location}"`);
      
      const device = findDevice('quạt', location);
      
      if (!device) {
        const availableFans = permittedDevices
          .filter((d) => d.name?.toLowerCase().includes('quạt'))
          .map((d) => d.location)
          .join(', ');
        
        const errorMsg = `❌ Không có quạt tại ${location}. Các vị trí có quạt: ${availableFans || 'không có'}`;
        console.log(`❌ [TẮT QUẠT] ${errorMsg}`);
        setLastAction(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log(`✅ [TẮT QUẠT] Tìm thấy device [ID=${device.id}] - Gọi API...`);
      await updateDeviceMutation.mutateAsync({
        deviceId: device.id,
        state: false,
        deviceName: device.name,
        location: device.location || '',
      });
      return;
    }

    // Không nhận diện được lệnh
    const errorMsg = '❌ Không nhận diện được lệnh. Hãy thử: "Bật đèn phòng khách", "Tắt quạt phòng ngủ"';
    console.log(`❌ [executeCommand] ${errorMsg}`);
    setLastAction(errorMsg);
    toast.error(errorMsg);
  };

  const handleStart = () => {
    if (!recognitionRef.current) {
      toast.error('Trình duyệt của bạn không hỗ trợ điều khiển bằng giọng nói');
      return;
    }
    setStatus('listening');
    setTranscript('');
    recognitionRef.current.start();
  };

  const handleStop = () => {
    recognitionRef.current?.stop();
    setStatus('idle');
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

      {(userRole === UserRole.GUEST || userRole === UserRole.HOUSE_OWNER) &&
        permittedDevices.length === 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">
                  Không có thiết bị để điều khiển
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  Bạn chưa được cấp quyền điều khiển bất kỳ thiết bị nào. Vui lòng liên hệ quản trị viên.
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
                {status === 'listening' ? 'Đang lắng nghe...' : status === 'processing' ? 'Đang xử lý...' : 'Sẵn sàng'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                disabled={!isSupported || status !== 'idle' || permittedDevices.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mic size={18} />
                Bắt đầu
              </button>
              <button
                onClick={handleStop}
                disabled={status === 'idle'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square size={18} />
                Dừng
              </button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Lệnh vừa nói</p>
            <div className="min-h-[70px] p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-800 dark:text-gray-200">
              {transcript || '---'}
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
                ? 'Lệnh gợi ý'
                : 'Thiết bị có thể điều khiển'}
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {userRole === UserRole.ADMIN
              ? 'Thử các câu lệnh mẫu sau để điều khiển thiết bị:'
              : 'Bạn có thể điều khiển các thiết bị sau:'}
          </p>
          <ul className="space-y-3">
            {userRole === UserRole.ADMIN ? (
              commandHints.map((hint) => (
                <li
                  key={hint}
                  className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm"
                >
                  "{hint}"
                </li>
              ))
            ) : permittedDevices.length > 0 ? (
              permittedDevices.map((device) => (
                <li
                  key={device.id}
                  className="px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm flex items-center gap-2"
                >
                  <Check size={16} />
                  <div>
                    <p className="font-semibold">[ID={device.id}] {device.name}</p>
                    <p className="text-xs opacity-75">{device.location}</p>
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




