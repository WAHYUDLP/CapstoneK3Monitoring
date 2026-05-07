import React, { useMemo, useState, useEffect } from 'react';
import { fetchViolations } from '../../api';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// initial placeholder until API results arrive
const initialMock = [
  { id: 0, area: 'Area 1', date: '23/3/2026', time: '07:34:44', violation: 'PPE01', evidence: '202603230734441.jpg' },
];

const pageSizeOptions = [10, 15, 20, 25];

const LogsContent = () => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsData, setLogsData] = useState(initialMock);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rows = await fetchViolations(200);
      if (!mounted) return;
      if (!rows || rows.length === 0) return;
      const mapped = rows.map((r) => {
        const dt = r.created_at ? new Date(r.created_at) : new Date();
        const date = dt.toLocaleDateString('id-ID');
        const time = dt.toLocaleTimeString('id-ID');
        const evidenceName = r.image_path ? r.image_path.split('/').pop() : '';
        const evidenceUrl = r.image_path || '';
        return {
          id: r.id,
          area: r.camera_id || 'Unknown',
          date,
          time,
          violationCode: r.violation_code || '-',
          violationLabel: r.violation_label || r.violation_type || '-',
          evidenceName,
          evidenceUrl,
        };
      });
      setLogsData(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalRows = logsData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return logsData.slice(start, end);
  }, [currentPage, pageSize, logsData]);

  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="h-full min-h-0 flex flex-col font-sans overflow-hidden">
      
      {/* Card wrapper */}
      <div className="bg-white rounded-xl shadow-sm border border-[#c8d6ea] flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e6ecf5]">
          <div>
            <h2 className="text-[20px] font-bold text-[#00265d]">PPE Violation History</h2>
            <p className="text-sm text-[#6b90c3] mt-0.5">Safety monitoring system detection logs.</p>
          </div>
          
          {/* Rows selector */}
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-[#6b90c3]">Rows per page</span>
            <div className="relative">
              <select
                id="page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="appearance-none h-9 pl-4 pr-10 rounded-lg border border-[#c8d6ea] bg-gray-50 text-sm font-semibold text-[#00265d] focus:outline-none focus:ring-2 focus:ring-[#003f98] focus:border-transparent cursor-pointer transition-all hover:bg-gray-100"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-[#6b90c3] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            {/* Table header */}
            <thead className="bg-[#f4f7fb]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#6b90c3] uppercase tracking-wider w-[5%]">No.</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#6b90c3] uppercase tracking-wider w-[15%]">Area</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#6b90c3] uppercase tracking-wider w-[15%]">Date</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#6b90c3] uppercase tracking-wider w-[15%]">Time</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#6b90c3] uppercase tracking-wider w-[20%]">Violation</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#6b90c3] uppercase tracking-wider w-[30%]">Evidence</th>
              </tr>
            </thead>
            
            {/* Table rows */}
            <tbody className="divide-y divide-[#e6ecf5]">
              {paginatedRows.map((log) => (
                <tr key={log.id} className="hover:bg-[#f0f4f9] transition-colors duration-200">
                  <td className="px-6 py-4 text-[14px] font-medium text-[#00265d]">{log.id}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#00265d]">{log.area}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#6b90c3]">{log.date}</td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#6b90c3]">{log.time}</td>
                  <td className="px-6 py-4">
                    {/* Violation badge */}
                    <div className="flex flex-col">
                      <span className="inline-flex w-fit items-center px-2.5 py-1 rounded-md text-[13px] font-semibold bg-[#e6ecf5] text-[#003f98] border border-[#c8d6ea]">
                        {log.violationCode}
                      </span>
                      <span className="mt-1 text-[12px] text-[#6b90c3]">
                        {log.violationLabel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={log.evidenceUrl || '#'}
                      target={log.evidenceUrl ? '_blank' : undefined}
                      rel={log.evidenceUrl ? 'noreferrer' : undefined}
                      className="text-[14px] font-semibold text-[#003f98] hover:text-[#002c6a] hover:underline underline-offset-4 transition-all flex items-center gap-1"
                    >
                      {log.evidenceName || '-'}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Card Footer / Pagination */}
        <div className="mt-auto border-t border-[#e6ecf5] bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-medium text-[#6b90c3]">
            Showing <strong className="text-[#00265d]">{startRow}</strong> to <strong className="text-[#00265d]">{endRow}</strong> of <strong className="text-[#00265d]">{totalRows}</strong> log entries
          </span>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center w-9 h-9 bg-white border border-[#c8d6ea] hover:bg-[#e6ecf5] text-[#00265d] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
              aria-label="Previous Page"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="flex items-center justify-center w-9 h-9 bg-white border border-[#c8d6ea] hover:bg-[#e6ecf5] text-[#00265d] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
              aria-label="Next Page"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LogsContent;