// src/components/SimulatedDataBanner.tsx
// Required disclaimer — shown on all map/availability views.
export default function SimulatedDataBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-800 text-center">
      ⚠️ <strong>MVP Demo:</strong> Parking zones, space counts, and occupancy data are simulated
      approximations. Not official KSU parking data.
    </div>
  );
}
