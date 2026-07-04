import { Download, FileUp, RotateCcw } from "lucide-react";
import { useRef } from "react";
import { useJobStore } from "@/store/useJobStore";

export function DataToolbar() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const database = useJobStore((state) => state.database);
  const importError = useJobStore((state) => state.importError);
  const exportJson = useJobStore((state) => state.exportJson);
  const importJson = useJobStore((state) => state.importJson);
  const resetToSample = useJobStore((state) => state.resetToSample);

  const handleImport = (file?: File) => {
    if (!file) return;
    void importJson(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-sm font-bold text-slate-900">数据管理</p>
        <p className="mt-1 text-xs text-slate-500">
          自动保存到浏览器本地，长期备份请导出 jobs.json。最近更新：
          {new Date(database.updatedAt).toLocaleString("zh-CN")}
        </p>
        {importError ? <p className="mt-2 text-xs font-semibold text-rose-600">{importError}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
        >
          <FileUp className="h-4 w-4" />
          导入 JSON
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
        >
          <Download className="h-4 w-4" />
          导出 JSON
        </button>
        <button
          type="button"
          onClick={resetToSample}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          <RotateCcw className="h-4 w-4" />
          重置示例
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => handleImport(event.target.files?.[0])}
      />
    </section>
  );
}
