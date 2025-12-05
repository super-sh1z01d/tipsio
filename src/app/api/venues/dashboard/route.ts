import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Mock data for development
function generateMockDashboard(period: string, distributionMode: string = "PERSONAL") {
  const multiplier = period === "today" ? 0.15 : period === "week" ? 1 : 4;
  
  return {
    venue: {
      id: "venue-001",
      name: "Cafe Organic Canggu",
      distributionMode,
    },
    metrics: {
      totalTips: Math.round(5200000 * multiplier),
      transactionCount: Math.round(148 * multiplier),
      averageTip: 35000,
      activeStaff: 8,
    },
    topStaff: [
      { id: "staff-001", displayName: "Agung", totalTips: Math.round(850000 * multiplier), tipsCount: Math.round(24 * multiplier) },
      { id: "staff-002", displayName: "Wayan", totalTips: Math.round(720000 * multiplier), tipsCount: Math.round(21 * multiplier) },
      { id: "staff-003", displayName: "Ketut", totalTips: Math.round(680000 * multiplier), tipsCount: Math.round(19 * multiplier) },
    ],
    hasPendingPayouts: true,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // For development, return mock data
    if (!session) {
      return NextResponse.json(generateMockDashboard(period));
    }

    // In production, fetch real data
    try {
      const { prisma } = await import("@/lib/prisma");

      const venue = await prisma.venue.findFirst({
        where: { managerId: session.user.id },
      });

      if (!venue) {
        return NextResponse.json(
          { error: "Venue not found" },
          { status: 404 }
        );
      }

      // Calculate date range
      const now = new Date();
      let startDate = new Date(now);
      
      if (period === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setMonth(startDate.getMonth() - 1);
      }

      // Get tips for period
      const tips = await prisma.tip.findMany({
        where: {
          venueId: venue.id,
          status: "PAID",
          createdAt: { gte: startDate },
        },
        include: {
          allocations: {
            include: { staff: true },
          },
        },
      });

      // Calculate metrics
      const totalTips = tips.reduce((sum, t) => sum + t.netAmount, 0);
      const transactionCount = tips.length;
      const averageTip = transactionCount > 0 ? Math.round(totalTips / transactionCount) : 0;

      // Get active staff count
      const activeStaff = await prisma.staff.count({
        where: { venueId: venue.id, status: "ACTIVE" },
      });

      // Calculate top staff
      const staffTotals: Record<string, { displayName: string; totalTips: number; tipsCount: number }> = {};
      
      for (const tip of tips) {
        for (const allocation of tip.allocations) {
          if (!staffTotals[allocation.staffId]) {
            staffTotals[allocation.staffId] = {
              displayName: allocation.staff.displayName,
              totalTips: 0,
              tipsCount: 0,
            };
          }
          staffTotals[allocation.staffId].totalTips += allocation.amount;
          staffTotals[allocation.staffId].tipsCount += 1;
        }
      }

      const topStaff = Object.entries(staffTotals)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.totalTips - a.totalTips)
        .slice(0, 5);

      // Check for pending payouts
      const pendingPayouts = await prisma.payout.count({
        where: { venueId: venue.id, status: "PENDING" },
      });

      // Get recent tips for history display
      const recentTips = tips
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((tip) => ({
          id: tip.id,
          amount: tip.netAmount,
          createdAt: tip.createdAt.toISOString(),
        }));

      return NextResponse.json({
        venue: { id: venue.id, name: venue.name, distributionMode: venue.distributionMode },
        metrics: {
          totalTips,
          transactionCount,
          averageTip,
          activeStaff,
        },
        topStaff,
        hasPendingPayouts: pendingPayouts > 0,
        recentTips,
      });
    } catch {
      // Database not available, return mock data
      return NextResponse.json(generateMockDashboard(period));
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
