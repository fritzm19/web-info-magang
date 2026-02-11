import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// --- OFFICE COORDINATES (Same as Check-In) ---
// Ganti dengan koordinat kantor Diskominfo Sulut yang asli
const OFFICE_LAT = 1.469940076052675;
const OFFICE_LNG = 124.84486754110868;
const MAX_DISTANCE_METERS = 10000; // Radius 100 meter

// Helper: Calculate Distance
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Get Coordinates from Frontend
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: "Lokasi tidak terdeteksi." }, { status: 400 });
    }

    // 2. Verify Location
    const distance = getDistanceFromLatLonInMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
    if (distance > MAX_DISTANCE_METERS) {
      return NextResponse.json({ error: `Anda di luar jangkauan kantor (${Math.round(distance)}m).` }, { status: 400 });
    }

    // 3. Find Today's Attendance
    const userId = parseInt(session.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        date: { gte: today }
      }
    });

    if (!attendance) {
      return NextResponse.json({ error: "Anda belum absen masuk hari ini." }, { status: 400 });
    }

    if (attendance.checkOut) {
      return NextResponse.json({ error: "Anda sudah absen pulang sebelumnya." }, { status: 400 });
    }

    // 4. Update Checkout Time
    const now = new Date();
    let newStatus = attendance.status;

    // Logic: If leaving before 16:00 (4 PM), mark as EARLY_LEAVE
    if (now.getHours() < 16) {
        newStatus = "EARLY_LEAVE";
    }

    await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        status: newStatus
      }
    });

    return NextResponse.json({ success: true, status: "CHECKED_OUT" });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}