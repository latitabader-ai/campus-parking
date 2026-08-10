// src/components/ZoneStatusBadge.tsx
import { getZoneColor } from '@/utils/zoneColor';
interface Props { occupied: number; total: number; }
export default function ZoneStatusBadge({ occupied, total }: Props) {
  const { label, badgeClass } = getZoneColor(occupied, total);
  return <span className={badgeClass}>{label}</span>;
}
