import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateShortCode } from "@/lib/qr";

const createStaffSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  fullName: z.string().optional(),
  role: z.enum(["WAITER", "BARTENDER", "BARISTA", "HOSTESS", "OTHER"]),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  participatesInPool: z.boolean().default(true),
  avatarUrl: z.string().url().optional(),
});

// GET /api/staff - List staff for current venue
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: "AUTH_REQUIRED", message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");

    if (!venueId) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "venueId is required" },
        { status: 400 }
      );
    }

    // Check access to venue
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Venue not found" },
        { status: 404 }
      );
    }

    if (session.user.role !== "ADMIN" && venue.managerId !== session.user.id) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Access denied" },
        { status: 403 }
      );
    }

    const staffList = await prisma.staff.findMany({
      where: { venueId },
      include: {
        qrCode: {
          select: {
            id: true,
            shortCode: true,
            status: true,
          },
        },
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            tips: true,
          },
        },
        tips: {
          where: {
            status: "PAID",
          },
          select: {
            amount: true,
          },
        },
        allocations: {
          select: {
            amount: true,
            payoutId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totalTips and balance for each staff member
    const staff = staffList.map((s) => {
      // Total from direct tips (PERSONAL mode) - only PAID tips
      const totalFromTips = s.tips.reduce((sum, tip) => sum + tip.amount, 0);
      // Total from allocations (POOLED mode)
      const totalFromAllocations = s.allocations.reduce((sum, a) => sum + a.amount, 0);
      const totalTips = totalFromTips + totalFromAllocations;
      
      // Paid out = allocations that have payoutId (already paid to staff)
      const paidOutFromAllocations = s.allocations.filter((a) => a.payoutId).reduce((sum, a) => sum + a.amount, 0);
      
      // Balance = total earned minus paid out
      // For direct tips, we assume they're not paid out yet unless there's an allocation
      const balance = totalTips - paidOutFromAllocations;
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tips, allocations, ...staffData } = s;
      return {
        ...staffData,
        totalTips,
        balance,
      };
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("List staff error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/staff - Create new staff member
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: "AUTH_REQUIRED", message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { venueId, ...staffData } = body;

    if (!venueId) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: "venueId is required" },
        { status: 400 }
      );
    }

    const parsed = createStaffSchema.safeParse(staffData);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Check access to venue
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Venue not found" },
        { status: 404 }
      );
    }

    if (session.user.role !== "ADMIN" && venue.managerId !== session.user.id) {
      return NextResponse.json(
        { code: "FORBIDDEN", message: "Access denied" },
        { status: 403 }
      );
    }

    // Create staff with personal QR code in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user account if phone or email provided
      let userId: string | undefined;
      const { phone, email, ...restData } = parsed.data;

      if (phone || email) {
        const user = await tx.user.create({
          data: {
            phone: phone || null,
            email: email || null,
            role: "STAFF",
          },
        });
        userId = user.id;
      }

      // Create staff member
      const staff = await tx.staff.create({
        data: {
          ...restData,
          venueId,
          userId,
        },
      });

      // Auto-generate personal QR code
      const shortCode = generateShortCode();
      const qrCode = await tx.qrCode.create({
        data: {
          type: "PERSONAL",
          label: staff.displayName,
          shortCode,
          venueId,
          staffId: staff.id,
        },
      });

      return { staff, qrCode };
    });

    return NextResponse.json({
      message: "Staff member created successfully",
      staff: result.staff,
      qrCode: result.qrCode,
    }, { status: 201 });
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { code: "INTERNAL_ERROR", message: "Internal server error" },
      { status: 500 }
    );
  }
}
