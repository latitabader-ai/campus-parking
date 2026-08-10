/**
 * prisma/seed.ts
 * KSU Campus Parking Management System — Deterministic seed data.
 *
 * DISCLAIMER: This seed creates SIMULATED MVP demo data.
 * - Zone boundaries are approximate polygons placed on the real KSU campus
 *   geography using OpenStreetMap coordinates. They do NOT represent official
 *   KSU parking zones or verified parking infrastructure.
 * - The 4,000 parking spaces and their occupancy data are entirely simulated.
 * - All user accounts, vehicle plates, and violations are fictional demo data.
 * - Saudi-style plate format used: ABC-1234 (3 Arabic-alphabet romanisation
 *   letters + 4 digits), purely for demo purposes.
 */

import { PrismaClient, UserRole, SpaceStatus, ViolationType, ViolationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Deterministic pseudo-random (seeded LCG) ────────────────────────────────
// We avoid Math.random() so the seed produces the same data every run.
function makeLcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
const rng = makeLcg(42);

function randFloat(min: number, max: number) {
  return min + rng() * (max - min);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ─── Coordinate helpers ───────────────────────────────────────────────────────
// 1 degree latitude  ≈ 111,000 m  →  100 m ≈ 0.0009°
// 1 degree longitude ≈  98,500 m  →  100 m ≈ 0.00102° (at lat 24.7°)
// Each zone gets a ~220 m × 180 m rectangular polygon.
const LAT_HALF = 0.00099;  // ±~110 m
const LNG_HALF = 0.00112;  // ±~110 m

function makePolygon(lat: number, lng: number) {
  const n = lat + LAT_HALF;
  const s = lat - LAT_HALF;
  const e = lng + LNG_HALF;
  const w = lng - LNG_HALF;
  // GeoJSON Polygon: [lng, lat] order, ring closed (first == last)
  return {
    type: 'Polygon' as const,
    coordinates: [
      [
        [w, n],
        [e, n],
        [e, s],
        [w, s],
        [w, n],
      ],
    ],
  };
}

// ─── Zone definitions ─────────────────────────────────────────────────────────
// Centres are placed on the real King Saud University campus, Riyadh, KSA.
// Boundaries are approximate rectangles for MVP visualisation only.
// Zone names describe general campus area associations, not official designations.
const ZONES = [
  { code: 'Z1', name: 'Central Zone',  description: 'Central campus area near the main library',           lat: 24.7246, lng: 46.6183, roles: [UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN] },
  { code: 'Z2', name: 'North Zone',    description: 'Northern campus area near student facilities',        lat: 24.7298, lng: 46.6170, roles: [UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN] },
  { code: 'Z3', name: 'East Zone',     description: 'Eastern campus area near engineering colleges',       lat: 24.7255, lng: 46.6230, roles: [UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN] },
  { code: 'Z4', name: 'West Zone',     description: 'Western campus area near health sciences colleges',   lat: 24.7240, lng: 46.6140, roles: [UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN] },
  { code: 'Z5', name: 'South Zone',    description: 'Southern campus area near the main entrance',        lat: 24.7195, lng: 46.6180, roles: [UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN] },
  { code: 'Z6', name: 'Staff Zone',    description: 'Administrative area — staff and faculty designated',  lat: 24.7260, lng: 46.6200, roles: [UserRole.SECURITY, UserRole.ADMIN] },
  { code: 'Z7', name: 'Visitor Zone',  description: 'Visitor and guest parking near the main gate',       lat: 24.7235, lng: 46.6155, roles: [UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN] },
  { code: 'Z8', name: 'Sports Zone',   description: 'Sports complex and outdoor facilities area',         lat: 24.7210, lng: 46.6215, roles: [UserRole.STUDENT, UserRole.SECURITY, UserRole.ADMIN] },
] as const;

const SPACES_PER_ZONE = 500;

// ─── Demo users (fictional) ───────────────────────────────────────────────────
const DEMO_USERS = [
  { email: 'student@demo.ksu',  name: 'Ahmed Al-Rashidi',   role: UserRole.STUDENT,  plate: 'ARS-4421' },
  { email: 'security@demo.ksu', name: 'Khalid Al-Zahrani',  role: UserRole.SECURITY, plate: null },
  { email: 'admin@demo.ksu',    name: 'Fatima Al-Otaibi',   role: UserRole.ADMIN,    plate: null },
] as const;

const DEMO_PASSWORD = 'Demo@12345';

// ─── Demo vehicles (fictional Saudi-style plates) ─────────────────────────────
// Format: 3 letters + hyphen + 4 digits (romanised Saudi plate style for demo)
const DEMO_PLATES = [
  'BKT-2201', 'DRZ-8873', 'FMS-4490', 'GHN-3312', 'HJK-7765',
  'KLM-1198', 'MNP-5543', 'QRS-8821', 'TVX-3367', 'WYZ-6654',
  'ABD-9981', 'CFG-2234', 'EHI-5567', 'JLO-8890', 'NPR-1123',
  'STU-4456', 'VWX-7789', 'YZA-0012', 'BCF-3345', 'DGJ-6678',
];

const VEHICLE_MAKES = ['Toyota', 'Hyundai', 'Kia', 'Ford', 'Chevrolet', 'Nissan', 'Honda', 'BMW', 'Mercedes-Benz', 'Lexus'];
const VEHICLE_MODELS: Record<string, string[]> = {
  Toyota:        ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'],
  Hyundai:       ['Sonata', 'Elantra', 'Tucson', 'Santa Fe'],
  Kia:           ['Optima', 'Sportage', 'Sorento', 'Cerato'],
  Ford:          ['Fusion', 'Explorer', 'F-150', 'Edge'],
  Chevrolet:     ['Malibu', 'Tahoe', 'Captiva', 'Spark'],
  Nissan:        ['Altima', 'Pathfinder', 'Patrol', 'Sentra'],
  Honda:         ['Accord', 'Civic', 'CR-V', 'Pilot'],
  'BMW':         ['3 Series', '5 Series', 'X5', 'X3'],
  'Mercedes-Benz':['C-Class', 'E-Class', 'GLE', 'GLC'],
  Lexus:         ['ES 350', 'IS 350', 'RX 350', 'LX 570'],
};
const VEHICLE_COLORS = ['White', 'Silver', 'Black', 'Grey', 'Red', 'Blue', 'Beige'];

// ─── Violation type distribution (weighted) ───────────────────────────────────
const VIOLATION_TYPES: ViolationType[] = [
  ViolationType.OVERSTAY,          // most common
  ViolationType.OVERSTAY,
  ViolationType.NO_PERMIT,
  ViolationType.NO_PERMIT,
  ViolationType.UNAUTHORIZED_ZONE,
  ViolationType.DOUBLE_PARK,
  ViolationType.OTHER,
];

// ─── Space status distribution ────────────────────────────────────────────────
// ~58% occupied, ~35% available, ~4% reserved, ~3% maintenance
function randomSpaceStatus(): SpaceStatus {
  const r = rng();
  if (r < 0.58) return SpaceStatus.OCCUPIED;
  if (r < 0.93) return SpaceStatus.AVAILABLE;
  if (r < 0.97) return SpaceStatus.RESERVED;
  return SpaceStatus.MAINTENANCE;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱  Starting KSU Campus Parking seed...');
  console.log('⚠️   DISCLAIMER: All data is simulated MVP demo data.');
  console.log('     Zone boundaries are approximate — not official KSU parking data.\n');

  // ── 1. Hash password once (all demo users share the same demo password) ─────
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ── 2. Upsert demo users ────────────────────────────────────────────────────
  console.log('👤  Creating demo users...');
  const createdUsers: Record<string, string> = {};  // email → id

  for (const u of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        role: u.role,
        vehiclePlate: u.plate ?? null,
      },
    });
    createdUsers[u.email] = user.id;
    console.log(`   ✓ ${u.role}: ${u.email}  (id: ${user.id})`);
  }

  // ── 3. Create zones ─────────────────────────────────────────────────────────
  console.log('\n🗺️   Creating 8 KSU campus zones...');
  const zoneIds: Record<string, string> = {};  // code → id

  for (const z of ZONES) {
    const polygon = makePolygon(z.lat, z.lng);
    const zone = await prisma.zone.upsert({
      where: { code: z.code },
      update: {
        name: z.name,
        description: z.description,
        centerLat: z.lat,
        centerLng: z.lng,
        coordinates: polygon,
        permittedRoles: [...z.roles],
        totalSpaces: SPACES_PER_ZONE,
      },
      create: {
        name: z.name,
        code: z.code,
        description: z.description,
        totalSpaces: SPACES_PER_ZONE,
        permittedRoles: [...z.roles],
        coordinates: polygon,
        centerLat: z.lat,
        centerLng: z.lng,
      },
    });
    zoneIds[z.code] = zone.id;
    console.log(`   ✓ ${z.code}: ${z.name}  (centre: ${z.lat}, ${z.lng})`);
  }

  // ── 4. Create spaces (500 per zone = 4,000 total) ───────────────────────────
  console.log('\n🅿️   Creating 4,000 simulated parking spaces (500 per zone)...');

  // Delete dependents first (FK order), then spaces — safe for re-seeding
  const delEvidence     = await prisma.evidence.deleteMany({});
  const delViolations   = await prisma.violation.deleteMany({});
  const delReservations = await prisma.reservation.deleteMany({});
  const delSnapshots    = await prisma.occupancySnapshot.deleteMany({});
  const deletedSpaces   = await prisma.space.deleteMany({});
  const cleared = delEvidence.count + delViolations.count + delReservations.count
                + delSnapshots.count + deletedSpaces.count;
  if (cleared > 0) {
    console.log(`   ↳ Cleared ${deletedSpaces.count} spaces + ${delViolations.count} violations + ${delEvidence.count} evidence + ${delReservations.count} reservations + ${delSnapshots.count} snapshots`);
  }

  let totalSpacesCreated = 0;

  for (const z of ZONES) {
    const zoneId = zoneIds[z.code];
    const latHalf = LAT_HALF * 0.85;  // Slightly inset from boundary
    const lngHalf = LNG_HALF * 0.85;

    const spacesData = Array.from({ length: SPACES_PER_ZONE }, (_, i) => {
      const num = String(i + 1).padStart(3, '0');
      const status = randomSpaceStatus();
      return {
        zoneId,
        spaceNumber: `${z.code}-${num}`,
        status,
        vehiclePlate: status === SpaceStatus.OCCUPIED ? pick(DEMO_PLATES) : null,
        coordinates: {
          lat: randFloat(z.lat - latHalf, z.lat + latHalf),
          lng: randFloat(z.lng - lngHalf, z.lng + lngHalf),
        },
      };
    });

    // Batch insert in chunks of 100 to avoid oversized queries
    const CHUNK = 100;
    for (let i = 0; i < spacesData.length; i += CHUNK) {
      await prisma.space.createMany({ data: spacesData.slice(i, i + CHUNK) });
    }

    const occupied = spacesData.filter(s => s.status === SpaceStatus.OCCUPIED).length;
    const available = spacesData.filter(s => s.status === SpaceStatus.AVAILABLE).length;
    totalSpacesCreated += spacesData.length;
    console.log(`   ✓ ${z.code}: ${spacesData.length} spaces  (occ: ${occupied}, avail: ${available})`);
  }

  console.log(`   ✓ Total: ${totalSpacesCreated} spaces created`);

  // ── 5. Create demo vehicles ─────────────────────────────────────────────────
  console.log('\n🚗  Creating 20 demo vehicles...');
  const studentId = createdUsers['student@demo.ksu'];

  for (let i = 0; i < DEMO_PLATES.length; i++) {
    const plate = DEMO_PLATES[i];
    const make = pick(VEHICLE_MAKES);
    const models = VEHICLE_MODELS[make] ?? ['Unknown'];
    await prisma.vehicle.upsert({
      where: { plate },
      update: {},
      create: {
        plate,
        ownerId: i === 0 ? studentId : null,  // First plate belongs to demo student
        make,
        model: pick(models),
        color: pick(VEHICLE_COLORS),
        isRegistered: true,
      },
    });
  }
  console.log(`   ✓ ${DEMO_PLATES.length} vehicles created (plate[0] linked to demo student)`);

  // ── 6. Create sample violations ─────────────────────────────────────────────
  console.log('\n🚨  Creating 5 sample violations...');

  // Need some space IDs for the violations
  const sampleSpaces = await prisma.space.findMany({
    where: { status: SpaceStatus.OCCUPIED },
    take: 10,
    select: { id: true, zoneId: true, vehiclePlate: true },
  });

  const securityId = createdUsers['security@demo.ksu'];
  const VIOLATION_STATUSES: ViolationStatus[] = [
    ViolationStatus.PENDING,
    ViolationStatus.PENDING,
    ViolationStatus.ACKNOWLEDGED,
    ViolationStatus.RESOLVED,
    ViolationStatus.DISMISSED,
  ];

  const violationNotes = [
    'Vehicle parked in restricted area without a valid permit.',
    'System-detected overstay: vehicle present for more than 4 hours.',
    'Vehicle blocking emergency access lane.',
    'No valid parking permit displayed.',
    'Double-parked across two designated spaces.',
  ];

  for (let i = 0; i < 5; i++) {
    const space = sampleSpaces[i % sampleSpaces.length];
    const vStatus = VIOLATION_STATUSES[i];
    const isResolved = vStatus === ViolationStatus.RESOLVED || vStatus === ViolationStatus.DISMISSED;

    await prisma.violation.create({
      data: {
        spaceId: space.id,
        vehiclePlate: space.vehiclePlate ?? pick(DEMO_PLATES),
        violationType: pick(VIOLATION_TYPES),
        status: vStatus,
        notes: violationNotes[i],
        // First 2 are system-generated (reportedById = null), rest by security staff
        reportedById: i < 2 ? null : securityId,
        resolvedById: isResolved ? securityId : null,
        resolvedAt: isResolved ? new Date() : null,
        detectedAt: new Date(Date.now() - (i + 1) * 3_600_000),  // staggered 1h apart
      },
    });
    console.log(`   ✓ Violation ${i + 1}: ${VIOLATION_STATUSES[i]} — ${violationNotes[i].slice(0, 50)}…`);
  }

  // ── 7. Create initial occupancy snapshots ────────────────────────────────────
  console.log('\n📊  Creating initial occupancy snapshots...');
  const allZones = await prisma.zone.findMany({ select: { id: true, code: true, totalSpaces: true } });

  for (const zone of allZones) {
    const counts = await prisma.space.groupBy({
      by: ['status'],
      where: { zoneId: zone.id },
      _count: { status: true },
    });
    const occupied  = counts.find(c => c.status === SpaceStatus.OCCUPIED)?._count.status ?? 0;
    const available = counts.find(c => c.status === SpaceStatus.AVAILABLE)?._count.status ?? 0;

    await prisma.occupancySnapshot.create({
      data: {
        zoneId: zone.id,
        occupied,
        available,
        total: zone.totalSpaces,
      },
    });
    console.log(`   ✓ ${zone.code}: snapshot  occ=${occupied}  avail=${available}`);
  }

  // ── 8. Final summary ─────────────────────────────────────────────────────────
  const counts = {
    users:      await prisma.user.count(),
    zones:      await prisma.zone.count(),
    spaces:     await prisma.space.count(),
    vehicles:   await prisma.vehicle.count(),
    violations: await prisma.violation.count(),
    snapshots:  await prisma.occupancySnapshot.count(),
  };

  console.log('\n✅  Seed complete!\n');
  console.log('📋  Database summary:');
  console.log(`   Users:              ${counts.users}`);
  console.log(`   Zones:              ${counts.zones}`);
  console.log(`   Spaces:             ${counts.spaces}`);
  console.log(`   Vehicles:           ${counts.vehicles}`);
  console.log(`   Violations:         ${counts.violations}`);
  console.log(`   Occupancy snapshots:${counts.snapshots}`);
  console.log('\n🔑  Demo credentials (password: Demo@12345):');
  for (const u of DEMO_USERS) {
    console.log(`   ${u.role.padEnd(8)} — ${u.email}`);
  }
  console.log('\n⚠️   Reminder: All data is simulated MVP demo data.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
