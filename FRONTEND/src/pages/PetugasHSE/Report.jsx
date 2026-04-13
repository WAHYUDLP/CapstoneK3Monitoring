import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileSearch } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Asumsinya props ini dikirim dari konfigurasi Sidebar
const ReportsContent = ({ 
  filterStartDate = '2026-03-27',
  filterEndDate = '2026-03-27',
  filterShift = 'Pagi (08:00 - 16:00)', 
  filterArea = 'Area 1 - Packing',
}) => {
  
  // Format tanggal ke gaya Indonesia (contoh: 27 Maret 2026)
  const formatDateLabel = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(`${dateValue}T00:00:00`);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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

  const systemData = {
    tanggal: displayedDateRange,
    sifKerja: filterShift,
    area: filterArea,
    // Auto-generate tanggal hari ini dengan format Bahasa Indonesia
    tanggalTerbit: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  };

  const initialLogs = useMemo(
    () => [
      { id: 1, waktu: '08:15:22', kode: 'PPE01', bukti: 'img_081522.jpg', tindakan: '' },
      { id: 2, waktu: '10:30:10', kode: 'PPE02', bukti: 'img_103010.jpg', tindakan: '' },
      { id: 3, waktu: '13:45:00', kode: 'PPE03', bukti: 'img_134500.jpg', tindakan: '' },
    ],
    [],
  );

  // 1. STATE INPUT USER
  const [pengawas, setPengawas] = useState('');
  const [cekSebelum, setCekSebelum] = useState(''); 
  const [cekSelama, setCekSelama] = useState('');   
  const [catatan, setCatatan] = useState('');
  const [logs, setLogs] = useState(initialLogs);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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
        setPengawas('');
        setCekSebelum('');
        setCekSelama('');
        setCatatan('');
        setLogs(initialLogs);
        setLastSavedAt(null);
      }
    } catch {
      setPengawas('');
      setCekSebelum('');
      setCekSelama('');
      setCatatan('');
      setLogs(initialLogs);
      setLastSavedAt(null);
    } finally {
      setIsHydrated(true);
    }
  }, [initialLogs, storageKey]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const timer = setTimeout(() => {
      const savedAt = new Date().toISOString();
      const payload = {
        pengawas,
        cekSebelum,
        cekSelama,
        catatan,
        logs,
        savedAt,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setLastSavedAt(savedAt);
    }, 350);

    return () => clearTimeout(timer);
  }, [isHydrated, pengawas, cekSebelum, cekSelama, catatan, logs, storageKey]);

  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

  const buildPdf = async () => {
    if (!reportPaperRef.current) {
      throw new Error('Report element is not ready.');
    }

    const canvas = await html2canvas(reportPaperRef.current, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
      windowWidth: reportPaperRef.current.scrollWidth,
      windowHeight: reportPaperRef.current.scrollHeight,
    });

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    let remainingHeight = imageHeight;
    let position = 0;

    pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
    remainingHeight -= pageHeight;

    while (remainingHeight > 0) {
      position = remainingHeight - imageHeight;
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight, undefined, 'FAST');
      remainingHeight -= pageHeight;
    }

    return pdf;
  };

  const handlePreviewPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdf = await buildPdf();
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      setPreviewPdfUrl((previousUrl) => {
        if (previousUrl) {
          URL.revokeObjectURL(previousUrl);
        }
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
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return '';
    });
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdf = await buildPdf();
      const fileName = `laporan-k3-${filterStartDate}-sampai-${filterEndDate}.pdf`;
      const blob = pdf.output('blob');
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

  // Minimal baris di tabel agar tidak terlihat kosong jika data sedikit
  const MINIMUM_ROWS = 5;
  const emptyRowsNeeded = Math.max(0, MINIMUM_ROWS - logs.length);

  return (
    <div className="h-full min-h-0 overflow-y-auto font-sans">
      
      {/* Tombol Aksi */}
      <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-end gap-3 print:hidden">
        <span className="mr-auto text-xs font-medium text-[#6b90c3]">
          {lastSavedAt
            ? `Auto-saved ${new Date(lastSavedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
            : 'Belum ada perubahan tersimpan'}
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
      <div ref={reportPaperRef} className="relative mx-auto w-full max-w-4xl bg-white p-8 text-black shadow-2xl min-h-264 md:p-14 print:m-0 print:max-w-none print:p-0 print:shadow-none print:w-full">
        
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
                <th className="border border-black px-3 py-2 w-[15%] font-bold">Waktu</th>
                <th className="border border-black px-3 py-2 w-[20%] font-bold">Kode Pelanggaran</th>
                <th className="border border-black px-3 py-2 w-[30%] font-bold">Bukti Pelanggaran</th>
                <th className="border border-black px-3 py-2 w-[35%] font-bold">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="print:break-inside-avoid">
                  <td className="border border-black px-3 py-2 font-medium">{log.waktu}</td>
                  <td className="border border-black px-3 py-2 font-medium">{log.kode}</td>
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
              
              {/* Render baris kosong agar format tabel tetap terbentuk seperti kertas kosong */}
              {[...Array(emptyRowsNeeded)].map((_, i) => (
                <tr key={`empty-${i}`} className="print:break-inside-avoid">
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