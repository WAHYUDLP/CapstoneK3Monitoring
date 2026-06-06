import React from 'react';

const PPE_TYPES = [
  { code: 'PPE-01', label: 'Tidak Memakai Helm' },
  { code: 'PPE-02', label: 'Tidak Memakai Rompi (Vest)' },
  { code: 'PPE-03', label: 'Tidak Memakai Masker' },
  { code: 'PPE-04', label: 'Tidak Memakai APD Lengkap' },
  { code: 'PPE-05', label: 'Mencoba Melepas Helm' },
  { code: 'PPE-06', label: 'Mencoba Melepas Rompi' },
  { code: 'PPE-07', label: 'Mencoba Melepas Masker' },
];

const ViolationTypes = () => {
  return (
    <div className="h-full min-h-0 flex flex-col font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-[#c8d6ea] p-6">
        <h2 className="text-[20px] font-bold text-[#00265d]">Jenis Pelanggaran PPE</h2>
        <p className="text-sm text-[#6b90c3] mt-1">Referensi kode pelanggaran untuk laporan dan dashboard.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PPE_TYPES.map((item) => (
            <div key={item.code} className="rounded-lg border border-[#e6ecf5] p-4">
              <div className="text-[14px] font-semibold text-[#003f98]">{item.code}</div>
              <div className="mt-1 text-[13px] text-[#6b90c3]">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViolationTypes;