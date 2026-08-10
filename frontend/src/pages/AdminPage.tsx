// src/pages/AdminPage.tsx — Minimal system admin screen
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import Spinner from '@/components/Spinner';

export default function AdminPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn:  () => analyticsApi.summary().then(r => r.data.data),
    refetchInterval: 30_000,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">System Administration</h1>
        <p className="text-sm text-gray-500 mt-1">Technical/operational role — not a primary product persona.</p>
      </div>

      {isLoading ? <Spinner /> : summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Spaces',       value: summary.totalSpaces          },
            { label: 'Occupied',           value: summary.occupied             },
            { label: 'Global Occupancy',   value: `${summary.globalOccupancyPct}%` },
            { label: 'Pending Violations', value: summary.pendingViolations    },
            { label: 'Active Reservations',value: summary.activeReservations   },
            { label: 'Registered Users',   value: summary.registeredUsers      },
          ].map(c => (
            <div key={c.label} className="card text-center">
              <p className="text-2xl font-bold text-green-700">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card text-sm text-gray-600 space-y-2">
        <p className="font-medium">API Endpoints</p>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Zone/space management: <code>/api/v1/zones</code></li>
          <li>User management: <code>/api/v1/auth</code></li>
          <li>Analytics: <code>/api/v1/analytics</code></li>
          <li>CSV export: <a href="/api/v1/analytics/export/violations" target="_blank" rel="noreferrer" className="text-green-700 hover:underline">Download violations CSV</a></li>
        </ul>
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mt-2">
          Full zone editing and user management is available via the REST API. A complete admin UI is planned for V1.
        </p>
      </div>
    </div>
  );
}
