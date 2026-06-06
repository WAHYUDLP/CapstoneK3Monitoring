import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchDashboardSummary, ping } from '../../api';
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X, LayoutDashboard, Video, FileText, History, Shield, LogOut } from 'lucide-react';
import LogsContent from './Logs';
import LiveCamsContent from './LiveCamsContent';
import ReportsContent from './Report';
import ViolationTypes from './ViolationTypes';

const optionsWaktu = ['All', 'Today', 'Weekly', 'Monthly'];
const optionsShift = ['All', 'Morning', 'Afternoon', 'Night'];
const optionsArea = ['All', 'Packing', 'Warehouse', 'Production'];

const dataByPeriod = {
  Today: {
    compliance: '84%',
    complianceDelta: '+5%',
    complianceDeltaColor: 'text-[#65d738]',
    violationTotal: '2.357',
    violationDelta: '-3%',
    violationDeltaColor: 'text-[#e24b4b]',
    mostViolated: 'PPE-01',
    mostViolatedLabel: 'Tidak Memakai Helm',
    mostViolatedPeriod: 'This day',
    compareText: 'vs yesterday',
    lineValues: [3, 11, 8, 18, 12, 15, 9, 6, 2],
    lineLabels: ['08.00', '10.00', '12.00', '14.00', '16.00', '18.00', '20.00', '22.00', '00.00'],
    barValues: [21, 14, 17, 9, 12],
  },
  Weekly: {
    compliance: '82%',
    complianceDelta: '+2%',
    complianceDeltaColor: 'text-[#65d738]',
    violationTotal: '13.941',
    violationDelta: '-6%',
    violationDeltaColor: 'text-[#e24b4b]',
    mostViolated: 'PPE-03',
    mostViolatedLabel: 'Tidak Memakai Masker',
    mostViolatedPeriod: 'This week',
    compareText: 'vs last week',
    lineValues: [6, 10, 12, 15, 11, 9, 7],
    lineLabels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    barValues: [58, 46, 64, 33, 41],
  },
  Monthly: {
    compliance: '79%',
    complianceDelta: '+4%',
    complianceDeltaColor: 'text-[#65d738]',
    violationTotal: '57.204',
    violationDelta: '-8%',
    violationDeltaColor: 'text-[#e24b4b]',
    mostViolated: 'PPE-02',
    mostViolatedLabel: 'Tidak Memakai Rompi (Vest)',
    mostViolatedPeriod: 'This month',
    compareText: 'vs last month',
    lineValues: [12, 14, 11, 15, 19, 16, 13, 12],
    lineLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
    barValues: [210, 244, 196, 158, 182],
  },
};

const buildLinePoints = (values, width, height, padding) => {
  const max = Math.max(...values, 25);
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

const DashboardMainContent = ({ selectedData, linePoints }) => {
  const barValues7 = (() => {
    const vals = Array.isArray(selectedData.barValues) ? selectedData.barValues.slice() : [];
    while (vals.length < 7) vals.push(0);
    return vals.slice(0, 7);
  })();

  const maxBarLocal = Math.max(...barValues7, 25);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#003f98] mb-4">Compliance Score</h2>
          <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3">{selectedData.compliance}</div>
          <div className="flex items-center gap-2 text-[20px] font-medium">
            <span className={selectedData.complianceDeltaColor}>{selectedData.complianceDelta}</span>
            <span className="text-[#003f98]">{selectedData.compareText}</span>
          </div>
        </div>

        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#003f98] mb-4">Total Violation</h2>
          <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3">{selectedData.violationTotal}</div>
          <div className="flex items-center gap-2 text-[20px] font-medium">
            <span className={selectedData.violationDeltaColor}>{selectedData.violationDelta}</span>
            <span className="text-[#003f98]">{selectedData.compareText}</span>
          </div>
        </div>

        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm">
          <h2 className="text-[22px] font-bold text-[#003f98] mb-4">Most Violated</h2>
          <div className="text-[64px] font-bold text-[#003f98] leading-none mb-3">{selectedData.mostViolated}</div>
          <div className="text-[20px] font-medium text-[#003f98]">{selectedData.mostViolatedPeriod}</div>
          <div className="text-[13px] font-medium text-[#6b90c3]">{selectedData.mostViolatedLabel}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm flex flex-col">
          <h3 className="text-[22px] font-bold text-[#003f98] mb-6">Violation by Time</h3>
          <div className="relative flex-1 bg-[#e6ecf5] rounded-xl p-4 min-h-75">
            <div className="absolute left-4 top-6 bottom-10 flex flex-col justify-between text-[11px] text-[#6b90c3] font-medium">
              <span>25</span>
              <span>20</span>
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>

            <div className="ml-8 h-full relative">
              <svg viewBox="0 0 760 240" className="w-full h-[calc(100%-30px)] absolute top-2 left-0 overflow-visible">
                {[0, 1, 2, 3, 4, 5].map((row) => {
                  const y = (240 / 5) * row;
                  return <line key={row} x1="0" y1={y} x2="100%" y2={y} stroke="#b0c4de" strokeWidth="1" strokeDasharray="4 4" />;
                })}
                <polyline fill="none" stroke="#6b90c3" strokeWidth="3" points={linePoints} strokeLinecap="round" strokeLinejoin="round" />
                {selectedData.lineValues.map((_, index) => {
                  const points = linePoints.split(' ');
                  const [x, y] = points[index].split(',');
                  return <circle key={index} cx={x} cy={y} r="5" fill="#f0f4f9" stroke="#003f98" strokeWidth="2.5" />;
                })}
              </svg>

              <div className="-bottom-2.5 absolute left-0 flex w-full justify-between px-2 text-[11px] font-medium text-[#6b90c3]">
                {selectedData.lineLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f0f4f9] rounded-xl border border-[#003f98] p-6 shadow-sm flex flex-col">
          <h3 className="text-[22px] font-bold text-[#003f98] mb-6">Violation by Type</h3>
          <div className="relative flex-1 bg-[#e6ecf5] rounded-xl p-4 min-h-75">
            <div className="absolute left-4 top-6 bottom-10 flex flex-col justify-between text-[11px] text-[#6b90c3] font-medium z-10">
              <span>25</span>
              <span>20</span>
              <span>15</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>

            <div className="ml-8 h-full relative">
              <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-2">
                {[0, 1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="w-full border-b border-dashed border-[#b0c4de]" />
                ))}
              </div>

              <div className="relative h-full flex items-end justify-around pb-8 pt-2 z-20">
                {barValues7.map((value, index) => {
                  const heightPercent = Math.min((value / maxBarLocal) * 100, 100);
                  return (
                    <div key={index} className="flex flex-col items-center justify-end h-full w-full">
                      <div className="w-10 sm:w-14 bg-[#2b60aa] rounded-t-md transition-all duration-500 ease-in-out" style={{ height: `${heightPercent}%` }} title={`Value: ${value}`} />
                    </div>
                  );
                })}
              </div>

              <div className="absolute bottom-2 left-0 w-full flex justify-around text-[11px] text-[#6b90c3] font-medium z-20">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i}>{`PPE-0${i + 1}`}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DashboardPetugasHSE = ({ onLogout, username = 'HSE Officer' }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [waktu, setWaktu] = useState('Today');
  const [shift, setShift] = useState('All');
  const [area, setArea] = useState('All');
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [logsStartDate, setLogsStartDate] = useState(todayIso);
  const [logsEndDate, setLogsEndDate] = useState(todayIso);
  const [logsArea, setLogsArea] = useState('All');
  const [reportDraft, setReportDraft] = useState({
    startDate: todayIso,
    endDate: todayIso,
    shift: 'All',
    area: 'All',
  });
  const [reportApplied, setReportApplied] = useState({
    startDate: todayIso,
    endDate: todayIso,
    shift: 'All',
    area: 'All',
  });
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [dashboardData, setDashboardData] = useState(dataByPeriod);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const selectedData = dashboardData[waktu] || dataByPeriod[waktu] || dataByPeriod.Today;

  const linePoints = useMemo(
    () => buildLinePoints(selectedData.lineValues, 760, 240, 20),
    [selectedData.lineValues]
  );

  const barValues7 = (() => {
    const vals = Array.isArray(selectedData.barValues) ? selectedData.barValues.slice() : [];
    while (vals.length < 7) vals.push(0);
    return vals.slice(0, 7);
  })();

  const maxBar = Math.max(...barValues7, 25);
  const showTimeAndShiftFilters = activeMenu !== 'Live Cams';

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await ping();
        if (!mounted) return;
        setServerStatus(res.status_server || 'Unknown');
      } catch {
        if (!mounted) return;
        setServerStatus('Offline ❌');
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setIsDashboardLoading(true);
      try {
        const period = waktu === 'All' ? 'All' : waktu;
        const data = await fetchDashboardSummary({ period, shift, area, signal: controller.signal });
        if (!mounted || !data) return;
        setDashboardData((prev) => ({ ...prev, [waktu]: data }));
      } finally {
        if (mounted) setIsDashboardLoading(false);
      }
    };
    load();
    return () => { mounted = false; controller.abort(); };
  }, [waktu, shift, area]);

  const handleMenuSelect = (menu) => {
    if (activeMenu === menu) return;
    setIsPageTransitioning(true);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    setTimeout(() => {
      setActiveMenu(menu);
    }, 150);
    setTimeout(() => {
      setIsPageTransitioning(false);
    }, 300);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      onLogout();
    }, 500);
  };

  const handleGenerateReport = () => {
    setReportApplied({ ...reportDraft });
  };

  const renderMainContent = () => {
    if (activeMenu === 'Logs') {
      return <LogsContent filterStartDate={logsStartDate} filterEndDate={logsEndDate} filterArea={logsArea} />;
    }

    if (activeMenu === 'Live Cams') {
      return <LiveCamsContent area={area} />;
    }

    if (activeMenu === 'Reports') {
      return (
        <ReportsContent
          filterStartDate={reportApplied.startDate}
          filterEndDate={reportApplied.endDate}
          filterShift={reportApplied.shift}
          filterArea={reportApplied.area}
        />
      );
    }

    if (activeMenu === 'PPE Types') {
      return <ViolationTypes />;
    }

    return (
      <DashboardMainContent
        selectedData={selectedData}
        linePoints={linePoints}
        maxBar={maxBar}
        waktu={waktu}
        shift={shift}
        area={area}
      />
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f0f3f8] font-sans text-[#00265d]">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-[#003f98] text-white flex items-center justify-between px-4 z-40 shadow-md">
        <div className="text-[18px] font-bold">HSE Monitoring</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 cursor-pointer rounded-md hover:bg-white/10 transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative top-0 left-0 z-30 flex h-screen shrink-0 flex-col bg-[#003f98] py-6 pt-20 lg:pt-6 text-white shadow-xl transition-all duration-300 ease-in-out ${
          isSidebarOpen 
            ? 'w-[280px] px-6 translate-x-0' 
            : 'w-[280px] lg:w-[80px] px-6 lg:px-4 -translate-x-full lg:translate-x-0'
        }`}>
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle Sidebar"
            className="hidden lg:flex absolute -right-3 top-10 items-center justify-center w-6 h-6 bg-white text-[#003f98] border border-[#003f98] rounded-full cursor-pointer hover:bg-gray-200 transition-colors z-40 shadow-md"
          >
            {isSidebarOpen ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
          </button>

          <div className={`flex items-center gap-4 mb-8 transition-all duration-300 ${!isSidebarOpen ? 'lg:justify-center' : ''}`}>
            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden border-2 border-white/20 shrink-0">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0' : 'opacity-100 w-auto'}`}>
              <p className="text-[10px] text-white/70 mb-1">Friday, 27 March 2026</p>
              <p className="text-[10px] text-white/70 mb-1">Backend: {serverStatus}</p>
              <p className="text-xs text-white/90">Hello,</p>
              <p className="text-lg font-bold tracking-wide">{username}</p>
            </div>
          </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto scroll-smooth pr-2 flex flex-col items-center lg:items-stretch">
          <div className="mb-6 h-px w-full bg-white/20" />

          <nav className="mb-8 flex flex-col gap-2 text-base w-full">
            {[
              { name: 'Dashboard', icon: LayoutDashboard },
              { name: 'Live Cams', icon: Video },
              { name: 'Reports', icon: FileText },
              { name: 'Logs', icon: History },
              { name: 'PPE Types', icon: Shield }
            ].map(({ name, icon: Icon }) => {
              const isActive = activeMenu === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleMenuSelect(name)}
                  title={!isSidebarOpen ? name : undefined}
                  className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full ${
                    isActive ? 'bg-white/20 font-bold text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } ${!isSidebarOpen ? 'lg:justify-center' : ''}`}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-300 ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}`}>
                    {name}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className={`w-full transition-all duration-300 shrink-0 overflow-hidden ${!isSidebarOpen ? 'lg:opacity-0 lg:h-0' : 'opacity-100 h-auto'}`}>
            {activeMenu === 'Reports' ? (
            <div className="mb-6 border-y border-white/20 py-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-sm text-white/90">Start Date</label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-white/30 bg-transparent px-3">
                    <input
                      type="date"
                      value={reportDraft.startDate}
                      onChange={(event) => setReportDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                      className="scheme-dark w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/90">End Date</label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-white/30 bg-transparent px-3">
                    <input
                      type="date"
                      value={reportDraft.endDate}
                      onChange={(event) => setReportDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                      className="scheme-dark w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/90">Shift</label>
                  <div className="relative">
                    <select
                      value={reportDraft.shift}
                      onChange={(event) => setReportDraft((prev) => ({ ...prev, shift: event.target.value }))}
                      className="h-10 w-full appearance-none rounded-md border border-white/30 bg-transparent px-3 text-white focus:border-white focus:outline-none cursor-pointer"
                    >
                      <option value="All" className="text-black">All</option>
                      <option value="Morning (08:00 - 16:00)" className="text-black">Morning (08:00 - 16:00)</option>
                      <option value="Afternoon (16:00 - 00:00)" className="text-black">Afternoon (16:00 - 00:00)</option>
                      <option value="Night (00:00 - 08:00)" className="text-black">Night (00:00 - 08:00)</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-white" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/90">Area</label>
                  <div className="relative">
                    <select
                      value={reportDraft.area}
                      onChange={(event) => setReportDraft((prev) => ({ ...prev, area: event.target.value }))}
                      className="h-10 w-full appearance-none rounded-md border border-white/30 bg-transparent px-3 text-white focus:border-white focus:outline-none cursor-pointer"
                    >
                      <option value="All" className="text-black">All</option>
                      <option value="Area 1 - Packing" className="text-black">Area 1 - Packing</option>
                      <option value="Area 2 - Warehouse" className="text-black">Area 2 - Warehouse</option>
                      <option value="Area 3 - Production" className="text-black">Area 3 - Production</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-white" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  className="mt-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#0f4aa1] hover:bg-white/90"
                >
                  Generate Report
                </button>
              </div>
            </div>
          ) : activeMenu === 'PPE Types' ? null : activeMenu === 'Logs' ? (
            <div className="mb-6 border-y border-white/20 py-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-sm text-white/90">Start Date</label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-white/30 bg-transparent px-3">
                    <input
                      type="date"
                      value={logsStartDate}
                      onChange={(event) => setLogsStartDate(event.target.value)}
                      className="scheme-dark w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/90">End Date</label>
                  <div className="flex h-10 items-center gap-2 rounded-md border border-white/30 bg-transparent px-3">
                    <input
                      type="date"
                      value={logsEndDate}
                      onChange={(event) => setLogsEndDate(event.target.value)}
                      className="scheme-dark w-full bg-transparent text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/90">Area</label>
                  <div className="relative">
                    <select
                      value={logsArea}
                      onChange={(event) => setLogsArea(event.target.value)}
                      className="h-10 w-full appearance-none rounded-md border border-white/30 bg-transparent px-3 text-white focus:border-white focus:outline-none cursor-pointer"
                    >
                      <option value="All" className="text-black">All</option>
                      <option value="Area 1 - Packing" className="text-black">Area 1 - Packing</option>
                      <option value="Area 2 - Warehouse" className="text-black">Area 2 - Warehouse</option>
                      <option value="Area 3 - Production" className="text-black">Area 3 - Production</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 border-y border-white/20 py-4">
              <div className="flex flex-col gap-4">
                {showTimeAndShiftFilters ? (
                  <>
                    <div>
                      <label className="mb-1 block text-sm text-white/90">Time</label>
                      <div className="relative">
                        <select
                          value={waktu}
                          onChange={(event) => setWaktu(event.target.value)}
                          className="h-10 w-full appearance-none rounded-md border border-white/30 bg-transparent px-3 text-white focus:border-white focus:outline-none cursor-pointer"
                        >
                          {optionsWaktu.map((option) => (
                            <option key={option} value={option} className="text-black">{option}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm text-white/90">Shift</label>
                      <div className="relative">
                        <select
                          value={shift}
                          onChange={(event) => setShift(event.target.value)}
                          className="h-10 w-full appearance-none rounded-md border border-white/30 bg-transparent px-3 text-white focus:border-white focus:outline-none cursor-pointer"
                        >
                          {optionsShift.map((option) => (
                            <option key={option} value={option} className="text-black">{option}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-white" />
                      </div>
                    </div>
                  </>
                ) : null}

                <div>
                  <label className="mb-1 block text-sm text-white/90">Area</label>
                  <div className="relative">
                    <select
                      value={area}
                      onChange={(event) => setArea(event.target.value)}
                      className="h-10 w-full appearance-none rounded-md border border-white/30 bg-transparent px-3 text-white focus:border-white focus:outline-none cursor-pointer"
                    >
                      {optionsArea.map((option) => (
                        <option key={option} value={option} className="text-black">{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title={!isSidebarOpen ? 'Log Out' : undefined}
          className={`mt-4 mb-2 mx-auto flex items-center justify-center gap-3 w-full rounded-md border border-white/50 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${isLoggingOut ? 'opacity-50' : 'opacity-100'} ${!isSidebarOpen ? 'lg:px-0 lg:w-12' : ''}`}
        >
          <LogOut size={20} className="shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${!isSidebarOpen ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </span>
        </button>
      </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col min-h-0 w-full overflow-hidden transition-all duration-300 pt-16 lg:pt-0 ${isPageTransitioning || isLoggingOut ? 'opacity-50' : 'opacity-100'}`}>
          <div className={`flex-1 w-full ${activeMenu === 'Logs' ? 'flex flex-col overflow-hidden min-h-0' : 'overflow-y-auto'} p-4 md:p-6 lg:p-8`}>
            {isDashboardLoading && activeMenu === 'Dashboard' ? (
              <div className="mb-4 text-sm font-medium text-[#6b90c3]">Loading dashboard data...</div>
            ) : null}
            <div className={`transition-opacity duration-300 h-full ${activeMenu === 'Logs' ? 'flex flex-col min-h-0' : ''} ${isPageTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {renderMainContent()}
            </div>
          </div>
        </main>
    </div>
  );
};

export default DashboardPetugasHSE;
