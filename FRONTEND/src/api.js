const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function ping() {
  try {
    const res = await fetch(`${API_BASE}/ping`);
    if (!res.ok) throw new Error('Network response not ok');
    return await res.json();
  } catch (err) {
    return { status_server: 'Offline ❌', status_database: 'Unknown', pesan: err.message };
  }
}

export async function fetchViolations(limit = 100) {
  try {
    const res = await fetch(`${API_BASE}/violations?limit=${limit}`);
    if (!res.ok) throw new Error('Network response not ok');
    const payload = await res.json();
    if (payload.status === 'success') return payload.data;
    throw new Error(payload.message || 'Failed to fetch');
  } catch (err) {
    console.error('fetchViolations error:', err);
    return [];
  }
}

export async function fetchViolationsFiltered({ limit = 200, startDate, endDate, shift = 'All', area = 'All' } = {}) {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (shift) params.append('shift', shift);
    if (area) params.append('area', area);
    const res = await fetch(`${API_BASE}/violations?${params.toString()}`);
    if (!res.ok) throw new Error('Network response not ok');
    const payload = await res.json();
    if (payload.status === 'success') return payload.data;
    throw new Error(payload.message || 'Failed to fetch');
  } catch (err) {
    console.error('fetchViolationsFiltered error:', err);
    return [];
  }
}

export async function fetchReportPdf(payload) {
  try {
    const res = await fetch(`${API_BASE}/report-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Network response not ok');
    return await res.blob();
  } catch (err) {
    console.error('fetchReportPdf error:', err);
    return null;
  }
}

export async function reportViolation(payload) {
  try {
    const res = await fetch(`${API_BASE}/report-violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('reportViolation error', err);
    return { status: 'error', message: err.message };
  }
}

export async function fetchDashboardSummary({ period = 'Today', shift = 'All', area = 'All', signal } = {}) {
  try {
    const params = new URLSearchParams({ period, shift, area });
    const res = await fetch(`${API_BASE}/dashboard-summary?${params.toString()}`, { signal });
    if (!res.ok) throw new Error('Network response not ok');
    const payload = await res.json();
    if (payload.status === 'success') return payload.data;
    throw new Error(payload.message || 'Failed to fetch');
  } catch (err) {
    console.error('fetchDashboardSummary error:', err);
    return null;
  }
}

export default { ping, fetchViolations, fetchViolationsFiltered, fetchReportPdf, reportViolation, fetchDashboardSummary };
