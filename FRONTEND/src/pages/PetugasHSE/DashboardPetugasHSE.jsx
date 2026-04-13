import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const optionsWaktu = ['Hari Ini', 'Mingguan', 'Bulanan'];
const optionsShift = ['Semua', 'Pagi', 'Siang', 'Malam'];
const optionsArea = ['Semua', 'Packing', 'Warehouse', 'Production'];

// Data dinamis sesuai permintaan
const dataByPeriod = {
  'Hari Ini': {
    compliance: '84%',
    complianceDelta: '+5%',
    complianceDeltaColor: 'text-[#65d738]', // Hijau
    violationTotal: '2.357',
    violationDelta: '-3%',
    violationDeltaColor: 'text-[#e24b4b]', // Merah
    mostViolated: 'PPE-01',
    mostViolatedPeriod: 'This day',
    compareText: 'vs yesterday',
    lineValues: [3, 11, 8, 18, 12, 15, 9, 6, 2],
    lineLabels: ['08.00', '10.00', '12.00', '14.00', '16.00', '18.00', '20.00', '22.00', '00.00'],
    barValues: [21, 14, 17, 9, 12],
  },
  Mingguan: {
    compliance: '82%',
    complianceDelta: '+2%',
    complianceDeltaColor: 'text-[#65d738]',
    violationTotal: '13.941',
    violationDelta: '-6%',
    violationDeltaColor: 'text-[#e24b4b]',
    mostViolated: 'PPE-03',
    mostViolatedPeriod: 'This week',
    compareText: 'vs last week',
    lineValues: [6, 10, 12, 15, 11, 9, 7],
    lineLabels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    barValues: [58, 46, 64, 33, 41],
  },
  Bulanan: {
    compliance: '79%',
    complianceDelta: '+4%',
    complianceDeltaColor: 'text-[#65d738]',
    violationTotal: '57.204',
    violationDelta: '-8%',
    violationDeltaColor: 'text-[#e24b4b]',
    mostViolated: 'PPE-02',
    mostViolatedPeriod: 'This month',
    compareText: 'vs last month',
    lineValues: [12, 14, 11, 15, 19, 16, 13, 12],
    lineLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    barValues: [210, 244, 196, 158, 182],
  },
};

// Fungsi kalkulasi titik SVG (diperbarui agar proporsional)
const buildLinePoints = (values, width, height, padding) => {
  const max = Math.max(...values, 25); // Menjaga skala visual
  const min = 0;
  const xStep = (width - padding * 2) / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = padding + index * xStep;
      const y = padding + ((max - value) / Math.max(max - min, 1)) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
};

const DashboardPetugasHSE = ({ onLogout }) => {
  const [waktu, setWaktu] = useState('Hari Ini');
  const [shift, setShift] = useState('Semua');
  const [area, setArea] = useState('Semua');

  const selectedData = dataByPeriod[waktu];

  // Ukuran kanvas SVG Line Chart
  const linePoints = useMemo(
    () => buildLinePoints(selectedData.lineValues, 760, 240, 20),
    [selectedData.lineValues]
  );

  const maxBar = Math.max(...selectedData.barValues, 25);

  return (
    <div className="flex min-h-screen bg-[#f0f3f8] font-sans text-[#00265d]">
      
      {/* SIDEBAR (Mirip dengan gambar referensi) */}
      <aside className="w-[280px] bg-[#003f98] text-white flex flex-col px-6 py-8 shadow-xl z-10">
        {/* Profile Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden border-2 border-white/20">
            {/* Ganti src ini dengan gambar profil aktual jika ada */}
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] text-white/70 mb-1">Jumat, 27 Maret 2026</p>
            <p className="text-xs text-white/90">Hello,</p>
            <p className="text-lg font-bold tracking-wide">Pham Hanni</p>
          </div>
        </div>

        <div className="h-px w-full bg-white/20 mb-6"></div>

        {/* Navigation Menus */}
        <nav className="flex flex-col gap-5 text-base mb-8">
          <div className="font-bold text-white cursor-pointer">Dashboard</div>
          <div className="text-white/80 hover:text-white cursor-pointer">Live Cams</div>
          <div className="text-white/80 hover:text-white cursor-pointer">Reports</div>
          <div className="text-white/80 hover:text-white cursor-pointer">Logs</div>
        </nav>

        <div className="h-px w-full bg-white/20 mb-6"></div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-auto">
          <div>
            <label className="block text-sm text-white/90 mb-1">Waktu</label>
            <div className="relative">
              <select
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                className="w-full h-10 appearance-none bg-transparent border border-white/30 rounded-md px-3 text-white focus:outline-none focus:border-white cursor-pointer"
              >
                {optionsWaktu.map((opt) => (
                  <option key={opt} value={opt} className="text-black">{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-white pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/90 mb-1">Shift</label>
            <div className="relative">
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full h-10 appearance-none bg-transparent border border-white/30 rounded-md px-3 text-white focus:outline-none focus:border-white cursor-pointer"
              >
                {optionsShift.map((opt) => (
                  <option key={opt} value={opt} className="text-black">{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-white pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/90 mb-1">Area</label>
            <div className="relative">
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full h-10 appearance-none bg-transparent border border-white/30 rounded-md px-3 text-white focus:outline-none focus:border-white cursor-pointer"
              >
                {optionsArea.map((opt) => (
                  <option key={opt} value={opt} className="text-black">{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-white pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="mt-8 border border-white/50 text-white rounded-md py-2 px-4 hover:bg-white/10 transition-colors w-[100px] text-sm text-center"
        >
          Log Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Top 3 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Compliance */}
          <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
            <h2 className="text-[22px] font-bold text-[#003f98] mb-4">Compliance Score</h2>
            <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3">
              {selectedData.compliance}
            </div>
            <div className="flex items-center gap-2 text-[20px] font-medium">
              <span className={selectedData.complianceDeltaColor}>{selectedData.complianceDelta}</span>
              <span className="text-[#003f98]">{selectedData.compareText}</span>
            </div>
          </div>

          {/* Card 2: Violation */}
          <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
            <h2 className="text-[22px] font-bold text-[#003f98] mb-4">Total Violation</h2>
            <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3">
              {selectedData.violationTotal}
            </div>
            <div className="flex items-center gap-2 text-[20px] font-medium">
              <span className={selectedData.violationDeltaColor}>{selectedData.violationDelta}</span>
              <span className="text-[#003f98]">{selectedData.compareText}</span>
            </div>
          </div>

          {/* Card 3: Most Violated */}
          <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
            <h2 className="text-[22px] font-bold text-[#003f98] mb-4">Most Violated</h2>
            <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3">
              {selectedData.mostViolated}
            </div>
            <div className="text-[20px] font-medium text-[#003f98]">
              {selectedData.mostViolatedPeriod}
            </div>
          </div>
        </div>

        {/* Bottom 2 Cards (Charts) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Line Chart Card */}
          <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm flex flex-col">
            <h3 className="text-[22px] font-bold text-[#003f98] mb-6">Violation by Time</h3>
            <div className="relative flex-1 bg-[#e6ecf5] rounded-xl p-4 min-h-[300px]">
              
              {/* Y-Axis Labels */}
              <div className="absolute left-4 top-6 bottom-10 flex flex-col justify-between text-[11px] text-[#6b90c3] font-medium">
                <span>25</span>
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>

              {/* Chart Graphic */}
              <div className="ml-8 h-full relative">
                <svg viewBox="0 0 760 240" className="w-full h-[calc(100%-30px)] absolute top-2 left-0 overflow-visible">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((row) => {
                    const y = (240 / 5) * row;
                    return (
                      <line
                        key={row}
                        x1="0"
                        y1={y}
                        x2="100%"
                        y2={y}
                        stroke="#b0c4de"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    );
                  })}
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#6b90c3"
                    strokeWidth="3"
                    points={linePoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dots */}
                  {selectedData.lineValues.map((_, index) => {
                    const points = linePoints.split(' ');
                    const [x, y] = points[index].split(',');
                    return (
                      <circle 
                        key={index} 
                        cx={x} 
                        cy={y} 
                        r="5" 
                        fill="#f0f4f9" 
                        stroke="#003f98" 
                        strokeWidth="2.5" 
                      />
                    );
                  })}
                </svg>

                {/* X-Axis Labels */}
                <div className="absolute bottom-[-10px] left-0 w-full flex justify-between text-[11px] text-[#6b90c3] font-medium px-2">
                  {selectedData.lineLabels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm flex flex-col">
            <h3 className="text-[22px] font-bold text-[#003f98] mb-6">Violation by Type</h3>
            <div className="relative flex-1 bg-[#e6ecf5] rounded-xl p-4 min-h-[300px]">
              
              {/* Y-Axis Labels */}
              <div className="absolute left-4 top-6 bottom-10 flex flex-col justify-between text-[11px] text-[#6b90c3] font-medium z-10">
                <span>25</span>
                <span>20</span>
                <span>15</span>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>

              <div className="ml-8 h-full relative">
                {/* Horizontal Dashed Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-2">
                  {[0, 1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="w-full border-b border-dashed border-[#b0c4de]"></div>
                  ))}
                </div>

                {/* Bars */}
                <div className="relative h-full flex items-end justify-around pb-8 pt-2 z-20">
                  {selectedData.barValues.map((value, index) => {
                    // Kalkulasi tinggi bar relatif terhadap maxBar
                    const heightPercent = Math.min((value / maxBar) * 100, 100);
                    return (
                      <div key={index} className="flex flex-col items-center justify-end h-full w-full">
                        <div
                          className="w-10 sm:w-14 bg-[#2b60aa] rounded-t-md transition-all duration-500 ease-in-out"
                          style={{ height: `${heightPercent}%` }}
                          title={`Value: ${value}`}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels */}
                <div className="absolute bottom-2 left-0 w-full flex justify-around text-[11px] text-[#6b90c3] font-medium z-20">
                  {selectedData.barValues.map((_, i) => (
                    <span key={i}>PPE-0{i + 1}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DashboardPetugasHSE;