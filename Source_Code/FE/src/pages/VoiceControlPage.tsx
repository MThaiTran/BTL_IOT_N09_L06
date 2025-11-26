import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

type RecognitionStatus = 'idle' | 'listening';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const commandHints = [
  'Bật đèn phòng khách',
  'Tắt quạt phòng ngủ',
  'Tăng tốc độ quạt',
  'Giảm nhiệt độ xuống 25 độ',
];

function VoiceControlPage() {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState('Chưa có lệnh nào');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

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

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        const action = parseCommand(text);
        setLastAction(action);
        toast.success(action);
      };

      recognition.onerror = () => {
        toast.error('Có lỗi khi nhận dạng giọng nói');
        setStatus('idle');
      };

      recognition.onend = () => {
        setStatus('idle');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const parseCommand = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('bật') && lower.includes('đèn')) {
      return 'Đã bật đèn theo yêu cầu';
    }
    if (lower.includes('tắt') && lower.includes('đèn')) {
      return 'Đã tắt đèn theo yêu cầu';
    }
    if (lower.includes('bật') && lower.includes('quạt')) {
      return 'Đã bật quạt theo yêu cầu';
    }
    if (lower.includes('tắt') && lower.includes('quạt')) {
      return 'Đã tắt quạt theo yêu cầu';
    }
    if (lower.includes('tăng') && lower.includes('quạt')) {
      return 'Đã tăng tốc độ quạt';
    }
    if (lower.includes('giảm') && (lower.includes('nhiệt') || lower.includes('độ'))) {
      return 'Đã giảm nhiệt độ về mức an toàn';
    }
    return 'Không nhận diện được lệnh, vui lòng thử lại';
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {status === 'listening' ? 'Đang lắng nghe...' : 'Sẵn sàng'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                disabled={!isSupported || status === 'listening'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                <Mic size={18} />
                Bắt đầu
              </button>
              <button
                onClick={handleStop}
                disabled={status === 'idle'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50"
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
              Lệnh gợi ý
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Thử các câu lệnh mẫu sau để điều khiển thiết bị:
          </p>
          <ul className="space-y-3">
            {commandHints.map((hint) => (
              <li
                key={hint}
                className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm"
              >
                “{hint}”
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VoiceControlPage;

