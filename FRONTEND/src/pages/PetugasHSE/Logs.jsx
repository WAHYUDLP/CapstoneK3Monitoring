import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

// Mock data for reference layout
const logsData = [
  { id: 1, area: 'Area 1', date: '23/3/2026', time: '07:34:44', violation: 'PPE01', evidence: '202603230734441.jpg' },
  { id: 2, area: 'Area 2', date: '23/3/2026', time: '07:36:21', violation: 'PPE02', evidence: '202603230736212.jpg' },
  { id: 3, area: 'Area 2', date: '23/3/2026', time: '07:37:46', violation: 'PPE03', evidence: '202603230737462.jpg' },
  { id: 4, area: 'Area 3', date: '23/3/2026', time: '09:56:14', violation: 'PPE02', evidence: '202603230956143.jpg' },
  { id: 5, area: 'Area 2', date: '24/3/2026', time: '14:21:55', violation: 'PPE02', evidence: '202603241421552.jpg' },
  { id: 6, area: 'Area 1', date: '23/3/2026', time: '07:34:44', violation: 'PPE01', evidence: '202603230734441.jpg' },
  { id: 7, area: 'Area 2', date: '23/3/2026', time: '07:36:21', violation: 'PPE02', evidence: '202603230736212.jpg' },
  { id: 8, area: 'Area 2', date: '23/3/2026', time: '07:37:46', violation: 'PPE03', evidence: '202603230737462.jpg' },
  { id: 9, area: 'Area 3', date: '23/3/2026', time: '09:56:14', violation: 'PPE02', evidence: '202603230956143.jpg' },
  { id: 10, area: 'Area 2', date: '24/3/2026', time: '14:21:55', violation: 'PPE02', evidence: '202603241421552.jpg' },
];

const pageSizeOptions = [10, 15, 20, 25];

const LogsContent = () => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalRows = logsData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return logsData.slice(start, end);
  }, [currentPage, pageSize]);

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
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-semibold bg-[#e6ecf5] text-[#003f98] border border-[#c8d6ea]">
                      {log.violation}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`#${log.evidence}`} 
                      className="text-[14px] font-semibold text-[#003f98] hover:text-[#002c6a] hover:underline underline-offset-4 transition-all flex items-center gap-1"
                    >
                      {log.evidence}
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