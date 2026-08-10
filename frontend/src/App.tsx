// src/App.tsx
// Root component — routing shell is fully built out in Sub-Task 10.
// For Sub-Task 1 this renders a status page confirming the stack is wired up.

import { Routes, Route } from 'react-router-dom';

function PlaceholderPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#006633]">
          KSU Campus Parking
        </h1>
        <p className="text-gray-500 text-sm">
          King Saud University — Campus Parking Management System
        </p>
        <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          MVP Demo — Simulated Data
        </span>
      </div>

      <div className="border border-gray-200 rounded-lg p-6 w-80 space-y-3 text-sm">
        <p className="font-medium text-gray-700">Sub-Task 1 ✅ Scaffolding complete</p>
        <ul className="space-y-1 text-gray-500">
          <li>✓ React 18 + Vite + TypeScript</li>
          <li>✓ Tailwind CSS configured</li>
          <li>✓ React Query + React Router</li>
          <li>✓ Backend Express API running</li>
          <li>✓ PostgreSQL via Docker Compose</li>
        </ul>
        <p className="text-gray-400 text-xs pt-2">
          Full UI implemented in Sub-Tasks 10–14.
        </p>
      </div>

      <a
        href="http://localhost:4000/health"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-[#006633] underline underline-offset-2"
      >
        → Check backend health endpoint
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<PlaceholderPage />} />
    </Routes>
  );
}
