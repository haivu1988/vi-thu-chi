import React, { useRef, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Cloud,
  RefreshCw,
  Smartphone,
  Laptop,
  ArrowRight,
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

export const DataSettings: React.FC = () => {
  const {
    transactions,
    budgets,
    categories,
    user,
    isSyncing,
    lastSyncedAt,
    exportDataJSON,
    exportDataCSV,
    importDataJSON,
    resetToDefaultData,
    loadSampleData,
    clearAllData,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showMsg = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJSON(content);
        if (ok) {
          showMsg('Khôi phục dữ liệu từ tệp tin JSON thành công!', 'success');
        } else {
          showMsg('Tệp tin không đúng định dạng dữ liệu Sổ Thu Chi.', 'error');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="pb-4 border-b border-neutral-100">
        <h3 className="text-base font-bold text-neutral-900">Sao Lưu & Quản Lý Dữ Liệu</h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Quản lý cơ chế đồng bộ đám mây và lưu trữ cục bộ cho sổ thu chi cá nhân của bạn
        </p>
      </div>

      {/* Realtime Cloud Sync Section */}
      <div className="p-5 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-indigo-50/30 border border-indigo-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-neutral-900">
                Đồng Bộ Đám Mây Realtime (Firebase Firestore)
              </h4>
              {user ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Đang hoạt động
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Chưa kết nối
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-xl leading-relaxed">
              {user ? (
                <>
                  Đang kết nối tài khoản <strong>{user.email || user.displayName || 'Ẩn danh'}</strong>.
                  Mọi khoản thu chi tạo mới, sửa, xóa trên điện thoại hoặc máy tính đều đồng bộ tức thì 2 chiều.
                </>
              ) : (
                <>
                  Đăng nhập một tài khoản (qua Google hoặc Email) trên điện thoại và máy tính để đồng bộ dữ liệu thời gian thực.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            {user ? (
              <>
                <span>Quản Lý Tài Khoản</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>Bật Đồng Bộ Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
          <div className="text-neutral-500 text-xs">Tổng số giao dịch</div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            {transactions.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Bản ghi thu & chi</div>
        </div>

        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
          <div className="text-neutral-500 text-xs">Danh mục hoạt động</div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            {categories.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Khoản mục thu chi</div>
        </div>

        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60">
          <div className="text-neutral-500 text-xs">Hạn mức ngân sách</div>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            {budgets.length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5">Mục tiêu kiểm soát</div>
        </div>
      </div>

      {/* Export & Import actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Export Card */}
        <div className="p-5 border border-neutral-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-neutral-900">Xuất Dữ Liệu</h4>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Tải dữ liệu ra máy tính dưới dạng bảng tính Excel (CSV) hoặc tệp sao lưu JSON để lưu trữ lâu dài.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={exportDataCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất CSV (Excel)</span>
            </button>
            <button
              onClick={exportDataJSON}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sao lưu JSON</span>
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="p-5 border border-neutral-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-neutral-900">Khôi Phục Dữ Liệu</h4>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Tải lên tệp sao lưu định dạng JSON đã lưu trước đó để đồng bộ lại dữ liệu thu chi của bạn.
          </p>
          <div className="pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Chọn Tệp JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 border border-rose-100 bg-rose-50/20 rounded-xl space-y-3">
        <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Vùng Thao Tác Cẩn Trọng</span>
        </h4>
        <p className="text-xs text-neutral-600">
          Bạn có thể xóa toàn bộ dữ liệu để làm mới về sổ trắng ban đầu, hoặc nạp bộ dữ liệu mẫu để trải nghiệm thử biểu đồ.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn đặt lại ứng dụng về SỔ TRẮNG HOÀN TOÀN? Toàn bộ giao dịch và ngân sách sẽ được làm sạch.')) {
                clearAllData();
                showMsg('Đã đặt lại ứng dụng về sổ trắng hoàn toàn!', 'success');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Về Sổ Trắng Hoàn Toàn</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Nạp dữ liệu mẫu để trải nghiệm thử biểu đồ thu chi? Dữ liệu hiện tại sẽ được cập nhật.')) {
                loadSampleData();
                showMsg('Đã nạp dữ liệu mẫu thành công!', 'success');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nạp Dữ Liệu Mẫu Thử Nghiệm</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync & Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};
