import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { filehandler, mqttAPI, tmpFileOrgApi } from "../services/api";
import { UploadCloud, CheckCircle2, X, Download } from "lucide-react";
import toast from "react-hot-toast";
import { FileDto } from "../interfaces/dtos.interface";

type Status = "idle" | "success" | "error";

function FirmwareUpdatePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionInput, setVersionInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: files,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useQuery<FileDto[]>({
    queryKey: ["files"],
    queryFn: () => filehandler.getAll().then((res) => res.data),
    staleTime: 10_000,
  });

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  };

  const resolveUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${window.location.origin}${url}`;
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file firmware trước");
      return;
    }
    if (!versionInput.trim()) {
      toast.error("Vui lòng nhập Version");
      return;
    }
    setStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileType", "bin");
      // console.log("Version input:", versionInput.trim());
      formData.append("version", versionInput.trim());

      const response = await filehandler.upload(formData);

      setStatus("success");
      setSelectedFile(null);
      setVersionInput("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Upload file thành công, chờ update firmware cho thiết bị");

      const tmpFileOrgApiResponse = await tmpFileOrgApi.upload(selectedFile);
      const rawUrl = tmpFileOrgApiResponse.data.data.url;
      const replacedUrl = rawUrl.replace(
        "http://tmpfiles.org/",
        "https://tmpfiles.org/dl/"
      );
      console.log("URL Before replace:", rawUrl);
      console.log("URL After replace:", replacedUrl);
      const otaDataResponse = await mqttAPI.publishOta(
        parseInt(versionInput.trim()), // ============================= Co the loi neu nhap linh tinh
        replacedUrl
      );
      console.log("MQTT payload (mock):", otaDataResponse.data);

      // Refresh file list after upload
      refetchFiles();
    } catch (err: any) {
      setStatus("error");
      toast.error(err?.response?.data?.message ?? "Cập nhật firmware thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cập nhật Firmware OTA
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Đẩy firmware mới cho thiết bị — chọn file .bin và nhập version, sau đó
          bấm Cập nhật.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File Firmware
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thiết bị
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".bin"
                      onChange={(e) =>
                        handleFileSelect(e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id="firmware-file-input"
                    />
                    {selectedFile ? (
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                        <span className="text-xs text-blue-700 dark:text-blue-300">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={clearFile}
                          className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                          disabled={status !== "idle"}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="firmware-file-input"
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                      >
                        Chọn file .bin
                      </label>
                    )}
                    {status === "success" && (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle2 size={14} />
                        Thành công
                      </span>
                    )}
                    {status === "error" && (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <X size={14} />
                        Lỗi
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="Nhập version (vd: v1.2.3)"
                    value={versionInput}
                    onChange={(e) => setVersionInput(e.target.value)}
                    disabled={status !== "idle"}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </td>

                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  —
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={handleUpdate}
                    disabled={!selectedFile || status !== "idle"}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UploadCloud size={18} />
                    Cập nhật
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danh sách file đã upload
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tên file
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Số hiệu phiên bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dung lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Upload lúc
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tải xuống
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filesLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Đang tải danh sách file...
                  </td>
                </tr>
              ) : files && files.length > 0 ? (
                files.map((file) => {
                  const url = resolveUrl(file.downloadUrl);
                  return (
                    <tr
                      key={file.fileName}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {file.fileName}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {file.fileType}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {file.version || "N/A"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {formatSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(file.uploadedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {url ? (
                          <a
                            className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline"
                            href={url}
                            download
                          >
                            <Download size={16} />
                            Tải
                          </a>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Chưa có file nào
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
