import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { devicesAPI, filehandler } from "../services/api";
import { Device } from "../interfaces/entities.interface";
import { UploadCloud, RefreshCcw, CheckCircle2, X } from "lucide-react";
import toast from "react-hot-toast";

interface FirmwareProgress {
  [deviceId: number]: {
    status: "idle" | "uploading" | "updating" | "success" | "error";
    percent: number;
    version: string;
    fileName?: string;
  };
}

function FirmwareUpdatePage() {
  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: () => devicesAPI.getAll().then((res) => res.data),
  });

  const [progress, setProgress] = useState<FirmwareProgress>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
  const fileInputRefs = useRef<Record<number, HTMLInputElement>>({});

  const handleFileSelect = (deviceId: number, file: File | null) => {
    if (!file) return;

    // Validate file type

    setSelectedFiles((prev) => ({ ...prev, [deviceId]: file }));
    setProgress((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        fileName: file.name,
        status: "idle",
      },
    }));
  };

  const handleUpdate = async (device: Device) => {
    const file = selectedFiles[device.id];
    if (!file) {
      toast.error("Vui lòng chọn file firmware trước");
      return;
    }

    setProgress((prev) => ({
      ...prev,
      [device.id]: {
        status: "uploading",
        percent: 0,
        version: prev[device.id]?.version || `v${(Math.random() * 2 + 1).toFixed(1)}`,
        fileName: file.name,
      },
    }));

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "bin");
      formData.append("deviceId", String(device.id));

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          const current = prev[device.id];
          if (!current) return prev;
          const newPercent = Math.min(current.percent + Math.random() * 15, 90);
          return {
            ...prev,
            [device.id]: {
              ...current,
              percent: newPercent,
              status: "uploading",
            },
          };
        });
      }, 400);

      // Call API
      const respone = await devicesAPI.upload(formData);
      console.log("File uploaded: ", file.name,"Form data: ", formData);
      console.log("Response from upload API: ", respone.data);
      //await filehandler.upload(formData);

      clearInterval(uploadInterval);

      // Simulate update progress
      setProgress((prev) => ({
        ...prev,
        [device.id]: {
          ...prev[device.id],
          percent: 95,
          status: "updating",
        },
      }));

      const updateInterval = setInterval(() => {
        setProgress((prev) => {
          const current = prev[device.id];
          if (!current) return prev;
          const newPercent = Math.min(current.percent + Math.random() * 5, 100);
          const status = newPercent >= 100 ? "success" : "updating";
          return {
            ...prev,
            [device.id]: {
              ...current,
              percent: newPercent,
              status,
            },
          };
        });
      }, 500);

      setTimeout(() => {
        clearInterval(updateInterval);
        setProgress((prev) => ({
          ...prev,
          [device.id]: {
            ...(prev[device.id] || {
              version: `v${(Math.random() * 2 + 1).toFixed(1)}`,
            }),
            percent: 100,
            status: "success",
          },
        }));
        setSelectedFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[device.id];
          return newFiles;
        });
        toast.success(`Cập nhật OTA cho ${device.name} thành công`);
      }, 2000);
    } catch (err: any) {
      setProgress((prev) => ({
        ...prev,
        [device.id]: {
          ...(prev[device.id] || {}),
          status: "error",
          percent: 0,
        },
      }));
      toast.error(
        err?.response?.data?.message ?? "Cập nhật firmware thất bại"
      );
    }
  };

  const clearFile = (deviceId: number) => {
    setSelectedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[deviceId];
      return newFiles;
    });
    setProgress((prev) => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        fileName: undefined,
        status: "idle",
      },
    }));
    if (fileInputRefs.current[deviceId]) {
      fileInputRefs.current[deviceId].value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Cập nhật Firmware OTA
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Đẩy firmware mới cho các thiết bị thông minh từ xa
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File Firmware
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                   Tiến trình
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-500">
                      <RefreshCcw className="animate-spin" size={18} />
                      Đang tải danh sách thiết bị...
                    </div>
                  </td>
                </tr>
              ) : devices && devices.length > 0 ? (
                devices.map((device) => {
                  const deviceProgress = progress[device.id];
                  const selectedFile = selectedFiles[device.id];
                  const isUpdating = deviceProgress?.status === "uploading" || deviceProgress?.status === "updating";

                  return (
                    <tr
                      key={device.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">  
                        <div className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {device.deviceTypeId === 1
                            ? "Đèn"
                            : device.deviceTypeId === 2
                            ? "Quạt"
                            : device.deviceTypeId === 3
                            ? "Cảm biến nhiệt độ & độ ẩm"
                            : device.deviceTypeId === 4
                            ? "Cảm biến ánh sáng"
                            : "Loại thiết bị khác"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {device.location}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            ref={(el) => {
                              if (el) fileInputRefs.current[device.id] = el;
                            }}
                            type="file"
                            accept=".bin"
                            onChange={(e) =>
                              handleFileSelect(device.id, e.target.files?.[0] || null)
                            }
                            disabled={isUpdating}
                            className="hidden"
                            id={`file-input-${device.id}`}
                          />
                          {selectedFile ? (
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                              <span className="text-xs text-blue-700 dark:text-blue-300">
                                {selectedFile.name}
                              </span>
                              <button
                                onClick={() => clearFile(device.id)}
                                disabled={isUpdating}
                                className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`file-input-${device.id}`}
                              className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer disabled:opacity-50"
                            >
                              Chọn file .bin
                            </label>
                          )}
                          {deviceProgress?.status === "success" && (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <CheckCircle2 size={14} />
                              Thành công
                            </span>
                          )}
                          {deviceProgress?.status === "error" && (
                            <span className="flex items-center gap-1 text-xs text-red-500">
                              <X size={14} />
                              Lỗi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                deviceProgress?.status === "success"
                                  ? "bg-green-500"
                                  : deviceProgress?.status === "error"
                                  ? "bg-red-500"
                                  : "bg-primary-500"
                              }`}
                              style={{
                                width: `${deviceProgress?.percent || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10 text-right">
                            {deviceProgress?.percent
                              ? `${Math.round(deviceProgress.percent)}%`
                              : "0%"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUpdate(device)}
                          disabled={isUpdating || !selectedFile}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UploadCloud size={18} />
                          {deviceProgress?.status === "uploading"
                            ? "Đang tải..."
                            : deviceProgress?.status === "updating"
                            ? "Đang cập nhật..."
                            : "Upload File"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Chưa có thiết bị nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FirmwareUpdatePage;
