import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// CONFIG: Office Coordinates
const OFFICE_LOCATION = {
  lat: 1.469940076052675,
  lng: 124.84486754110868
};
const MAX_DISTANCE_METERS = 10000;

// Helper: Haversine Formula
const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export async function POST(request: Request) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { lat, lng } = body;

    // 2. Location Check
    if (!lat || !lng) return NextResponse.json({ success: false, error: "Location missing" }, { status: 400 });
    
    const distance = getDistanceFromLatLonInMeters(lat, lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
    if (distance > MAX_DISTANCE_METERS) {
      return NextResponse.json({ 
        success: false, 
        error: `Too far from office! (${Math.round(distance)}m)` 
      }, { status: 403 });
    }

    // 3. Logic: Is it LATE? (After 08:00 AM)
    const now = new Date();
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15); // Late if > 08:15

    // 4. Check for existing "Late Permit"
    // We look for a permit for TODAY that is APPROVED
    const today = new Date();
    today.setHours(0,0,0,0);

    const permit = await prisma.permission.findFirst({
      where: {
        userId,
        date: { gte: today },
        type: "LATE_ARRIVAL",
        status: "APPROVED"
      }
    });

    // 5. Determine Status
    let status = "PRESENT";
    if (isLate) {
      status = permit ? "LATE_EXCUSED" : "LATE";
    }

    // 6. Save to DB
    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
        where: { userId, date: { gte: today } }
    });

    if (existing) {
        return NextResponse.json({ success: false, error: "Already checked in today!" }, { status: 400 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        checkIn: now,
        // @ts-ignore: Enums can be tricky in simple strings, ensuring it matches Prisma Enum
        status: status as any, 
        permissionId: permit?.id
      }
    });

    return NextResponse.json({ success: true, data: attendance });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}