import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileSearch } from 'lucide-react';
import { fetchReportPdf, fetchViolationsFiltered } from '../../api';

// Asumsinya props ini dikirim dari konfigurasi Sidebar
const ReportsContent = ({
  filterStartDate = new Date().toISOString().slice(0, 10),
  filterEndDate = new Date().toISOString().slice(0, 10),
  filterShift = 'All',
  filterArea = 'All',
}) => {

  const formatDateLabel = (dateValue) => {
    if (!dateValue) return '';
    const [year, month, day] = dateValue.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  };

  const displayedDateRange = (() => {
    const startLabel = formatDateLabel(filterStartDate);
    const endLabel = formatDateLabel(filterEndDate);
    if (startLabel && endLabel && startLabel === endLabel) {
      return startLabel;
    }
    return `${startLabel} - ${endLabel}`;
  })();

  const formatShiftLabel = (value) => {
    if (!value || value === 'All') return 'Semua Shift';
    if (value.startsWith('Morning')) return 'Pagi (08:00 - 16:00)';
    if (value.startsWith('Afternoon')) return 'Sore (16:00 - 00:00)';
    if (value.startsWith('Night')) return 'Malam (00:00 - 08:00)';
    return value;
  };

  const formatAreaLabel = (value) => {
    if (!value || value === 'All') return 'Semua Area';
    return value;
  };

  const normalizeShift = (value) => {
    if (!value) return 'All';
    if (value.startsWith('Morning')) return 'Morning';
    if (value.startsWith('Afternoon')) return 'Afternoon';
    if (value.startsWith('Night')) return 'Night';
    if (value === 'All') return 'All';
    return value;
  };

  const systemData = {
    tanggal: displayedDateRange,
    sifKerja: formatShiftLabel(filterShift),
    area: formatAreaLabel(filterArea),
    tanggalTerbit: new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' 
    }).format(new Date()),
  };

  const initialLogs = useMemo(() => [], []);

  // 1. STATE INPUT USER
  const [pengawas, setPengawas] = useState('');
  const [cekSebelum, setCekSebelum] = useState('');
  const [cekSelama, setCekSelama] = useState('');
  const [catatan, setCatatan] = useState('');
  const [logs, setLogs] = useState(initialLogs);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  
  // STATE BARU: Untuk ngetrack apakah sedang menyimpan atau tidak
  const [isSaving, setIsSaving] = useState(false); 

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoadingViolations, setIsLoadingViolations] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const reportPaperRef = useRef(null);

  const storageKey = `hse-report-draft:${filterStartDate}:${filterEndDate}:${filterShift}:${filterArea}`;

  // 2. HANDLERS
  const handleTindakanChange = (id, value) => {
    setLogs((prevLogs) => prevLogs.map((log) => (log.id === id ? { ...log, tindakan: value } : log)));
  };

  useEffect(() => {
    try {
      const rawData = localStorage.getItem(storageKey);
      if (rawData) {
        const parsed = JSON.parse(rawData);
        setPengawas(parsed.pengawas ?? '');
        setCekSebelum(parsed.cekSebelum ?? '');
        setCekSelama(parsed.cekSelama ?? '');
        setCatatan(parsed.catatan ?? '');
        setLogs(parsed.logs ?? initialLogs);
        setLastSavedAt(parsed.savedAt ?? null);
      } else {
        setPengawas(''); setCekSebelum(''); setCekSelama(''); setCatatan(''); setLogs(initialLogs); setLastSavedAt(null);
      }
    } catch {
      setPengawas(''); setCekSebelum(''); setCekSelama(''); setCatatan(''); setLogs(initialLogs); setLastSavedAt(null);
    } finally {
      setIsHydrated(true);
    }
  }, [initialLogs, storageKey]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoadingViolations(true);
      const rows = await fetchViolationsFiltered({
        startDate: filterStartDate,
        endDate: filterEndDate,
        shift: normalizeShift(filterShift),
        area: filterArea,
      });

      if (!mounted) return;
      setIsLoadingViolations(false);
      if (!rows || rows.length === 0) {
        setLogs([]);
        return;
      }

      const sortedRows = [...rows].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });

      const mapped = sortedRows.map((r) => {
        const dt = r.created_at ? new Date(r.created_at) : new Date();
        
        const dateStr = new Intl.DateTimeFormat('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Jakarta'
        }).format(dt);

        const timeStr = new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta', hour12: false
        }).format(dt).replace(/:/g, '.');

        const evidence = r.image_path ? r.image_path.split('/').pop() : '';
        return {
          id: r.id,
          tanggal: dateStr,
          waktu: timeStr,
          kode: r.violation_code || '-',
          label: r.violation_label || r.violation_type || '-',
          bukti: evidence,
          tindakan: '',
        };
      });
      setLogs(mapped);
    })();

    return () => {
      mounted = false;
    };
  }, [filterStartDate, filterEndDate, filterShift, filterArea]);

  useEffect(() => {
    if (!isHydrated) return;

    // Pas mulai ngetik, kita set indikator "Menyimpan..."
    setIsSaving(true);

    const timer = setTimeout(() => {
      const savedAt = "saved"; 
      const payload = { pengawas, cekSebelum, cekSelama, catatan, logs, savedAt };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSavedAt(savedAt);
      
      // Pas selesai disimpan (setelah delay berenti ngetik), matikan indikator muter-muter
      setIsSaving(false);
    }, 500); // Waktu delaynya aku bikin 500ms biar animasinya sempat keliatan jelas

    return () => clearTimeout(timer);
  }, [isHydrated, pengawas, cekSebelum, cekSelama, catatan, logs, storageKey]);

  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

  const buildPdfBlob = async () => {
    const tindakanMap = logs.reduce((acc, log) => {
      if (log.tindakan) {
        acc[String(log.id)] = log.tindakan;
      }
      return acc;
    }, {});

    return await fetchReportPdf({
      start_date: filterStartDate,
      end_date: filterEndDate,
      shift: normalizeShift(filterShift),
      area: filterArea,
      pengawas,
      cek_sebelum: cekSebelum,
      cek_selama: cekSelama,
      catatan,
      tindakan_map: tindakanMap,
    });
  };

  const handlePreviewPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const blob = await buildPdfBlob();
      if (!blob) throw new Error('PDF tidak tersedia');
      const blobUrl = URL.createObjectURL(blob);
      setPreviewPdfUrl((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        return blobUrl;
      });
      setIsPreviewOpen(true);
    } catch (error) {
      console.error(error);
      alert('Preview PDF gagal dibuat. Silakan coba lagi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewPdfUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return '';
    });
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const blob = await buildPdfBlob();
      if (!blob) throw new Error('PDF tidak tersedia');
      const fileName = `laporan-k3-${filterStartDate}-sampai-${filterEndDate}.pdf`;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert('File PDF gagal diunduh. Silakan coba lagi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const MINIMUM_ROWS = 5;
  const emptyRowsNeeded = Math.max(0, MINIMUM_ROWS - logs.length);

  return (
    <div className={`h-full min-h-0 overflow-y-auto font-sans transition-opacity duration-300 ${isLoadingViolations ? 'opacity-50' : 'opacity-100'} relative`}>
      {isLoadingViolations && (
        <div className="absolute inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#003f98] border-t-transparent" />
            <p className="text-sm font-medium text-[#003f98]">Loading violations...</p>
          </div>
        </div>
      )}
      {/* Tombol Aksi */}
      <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-end gap-3 print:hidden">
        
        {/* LOGIKA AUTO-SAVE MENGGUNAKAN ANIMASI SPINNER */}
        <span className="mr-auto flex items-center gap-2 text-xs font-medium text-[#6b90c3] transition-all">
          {isSaving ? (
            <>
              {/* Ini SVG Lingkaran Spinner */}
              <svg className="h-4 w-4 animate-spin text-[#6b90c3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#65d738]/20 text-[#65d738]">✔</span> 
              Tersimpan
            </span>
          ) : (
            'Belum ada perubahan'
          )}
        </span>

        <button
          type="button"
          onClick={handlePreviewPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 bg-white text-[#00265d] border border-[#00265d] px-4 py-2 rounded-md font-semibold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <FileSearch className="w-4 h-4" /> {isGeneratingPdf ? 'Membuat PDF...' : 'Preview PDF'}
        </button>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 bg-[#003f98] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#002c6a] transition-colors shadow-md"
        >
          <Download className="w-4 h-4" /> {isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF'}
        </button>
      </div>

      {/* Kertas Laporan */}
      <div
        ref={reportPaperRef}
        className="relative mx-auto w-full max-w-4xl bg-white p-8 text-black shadow-2xl min-h-264 md:p-14 print:m-0 print:max-w-none print:p-0 print:shadow-none print:w-full"
        style={{ width: '210mm', maxWidth: '100%', minHeight: '297mm' }}
      >
        {/* HEADER */}
        <div className="flex items-center gap-6 mb-4">
          <h1 className="text-[44px] font-bold text-[#003399] tracking-wider leading-none">EPSON</h1>
          <div className="h-12.5 w-0.5 bg-black"></div>
          <div>
            <h2 className="text-[18px] font-bold leading-tight">Laporan Harian Keamanan dan Kesehatan Kerja</h2>
            <h3 className="text-[18px] font-bold leading-tight">PT. Indonesia Epson Industry</h3>
          </div>
        </div>
        <div className="mb-8 w-full border-b-2 border-[#003399]"></div>

        {/* METADATA */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-10 text-[14px] font-semibold">
          <div className="flex"><span className="w-28">Tanggal</span><span>: {systemData.tanggal}</span></div>
          <div className="flex"><span className="w-32">Tanggal Terbit</span><span>: {systemData.tanggalTerbit}</span></div>
          <div className="flex"><span className="w-28">Shift Kerja</span><span>: {systemData.sifKerja}</span></div>

          <div className="flex items-center">
            <span className="w-32">Pengawas</span>
            <span>:</span>
            <input
              type="text"
              value={pengawas}
              onChange={(e) => setPengawas(e.target.value)}
              placeholder="[Isi nama pengawas]"
              className="ml-2 flex-1 border-b border-[#d1d5db] focus:border-black focus:outline-none bg-transparent placeholder:text-[#d1d5db] print:border-none print:placeholder-transparent"
            />
          </div>

          <div className="flex"><span className="w-28">Area</span><span>: {systemData.area}</span></div>
        </div>

        {/* CEKLIS HARIAN */}
        <div className="mb-10 text-[14px] font-semibold">
          <h4 className="font-bold mb-4">Ceklis Harian:</h4>

          <div className="mb-4">
            <p className="mb-2">1. Pengecekan APD Sebelum Produksi:</p>
            <div className="flex gap-8 ml-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cekSebelum" value="Ya" checked={cekSebelum === 'Ya'} onChange={(e) => setCekSebelum(e.target.value)} className="w-4 h-4 border-[#9ca3af] text-black focus:ring-black" /> Ya
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cekSebelum" value="Tidak" checked={cekSebelum === 'Tidak'} onChange={(e) => setCekSebelum(e.target.value)} className="w-4 h-4 border-[#9ca3af] text-black focus:ring-black" /> Tidak
              </label>
            </div>
          </div>

          <div>
            <p className="mb-2">2. Kepatuhan APD Selama Produksi:</p>
            <div className="flex gap-8 ml-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cekSelama" value="Ya" checked={cekSelama === 'Ya'} onChange={(e) => setCekSelama(e.target.value)} className="w-4 h-4 border-[#9ca3af] text-black focus:ring-black" /> Ya
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cekSelama" value="Tidak" checked={cekSelama === 'Tidak'} onChange={(e) => setCekSelama(e.target.value)} className="w-4 h-4 border-[#9ca3af] text-black focus:ring-black" /> Tidak
              </label>
            </div>
          </div>
        </div>

        {/* CATATAN PENGAWAS */}
        <div className="mb-10">
          <h4 className="font-bold mb-2 text-[14px]">Catatan Pengawas:</h4>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows="3"
            placeholder="[Tambahkan catatan operasional di sini...]"
            className="w-full border-b border-black outline-none resize-none bg-transparent placeholder:text-[#d1d5db] leading-8 font-medium text-[14px]"
            style={{ backgroundImage: 'linear-gradient(transparent, transparent 31px, black 0)', backgroundSize: '100% 32px' }}
          ></textarea>
        </div>

        {/* TABEL LOG PELANGGARAN */}
        <div>
          <h4 className="font-bold mb-2 text-[14px]">Log Pelanggaran:</h4>
          <table className="w-full border-collapse border border-black text-[13px] text-left">
            <thead>
              <tr className="bg-[#f3f4f6] print:bg-[#f3f4f6]">
                <th className="border border-black px-3 py-2 w-[15%] font-bold">Tanggal</th>
                <th className="border border-black px-3 py-2 w-[12%] font-bold">Waktu</th>
                <th className="border border-black px-3 py-2 w-[22%] font-bold">Kode Pelanggaran</th>
                <th className="border border-black px-3 py-2 w-[26%] font-bold">Bukti Pelanggaran</th>
                <th className="border border-black px-3 py-2 w-[25%] font-bold">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="print:break-inside-avoid">
                  <td className="border border-black px-3 py-2 font-medium">{log.tanggal}</td>
                  <td className="border border-black px-3 py-2 font-medium">{log.waktu}</td>
                  <td className="border border-black px-3 py-2 font-medium">
                    <div className="flex flex-col break-words whitespace-normal">
                      <span className="break-words">{log.kode}</span>
                      <span className="text-[11px] text-[#6b7280] break-words">{log.label}</span>
                    </div>
                  </td>
                  <td className="border border-black px-3 py-2 text-[#1d4ed8] underline font-medium">{log.bukti}</td>
                  <td className="border border-black p-0">
                    <input
                      type="text"
                      value={log.tindakan}
                      onChange={(e) => handleTindakanChange(log.id, e.target.value)}
                      placeholder="[Isi tindakan yang diambil]"
                      className="w-full h-full min-h-9 px-3 py-2 outline-none border-none bg-transparent placeholder:text-[#d1d5db] font-medium transition-colors focus:bg-[#eff6ff] print:placeholder-transparent"
                    />
                  </td>
                </tr>
              ))}

              {[...Array(emptyRowsNeeded)].map((_, i) => (
                <tr key={`empty-${i}`} className="print:break-inside-avoid">
                  <td className="border border-black px-3 py-4"></td>
                  <td className="border border-black px-3 py-4"></td>
                  <td className="border border-black px-3 py-4"></td>
                  <td className="border border-black px-3 py-4"></td>
                  <td className="border border-black px-3 py-4"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPreviewOpen && previewPdfUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 print:hidden">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-700">Preview PDF Laporan K3</h3>
              <button
                type="button"
                onClick={handleClosePreview}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
            <iframe title="PDF Preview" src={previewPdfUrl} className="h-full w-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReportsContent;