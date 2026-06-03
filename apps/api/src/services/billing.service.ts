import { AppError } from "../lib/http";
import { prisma } from "../lib/prisma";

export const pricingTiers = [
  { id: "SMALL", label: "小型活動", attendeeRange: "1–199 人", attendeeCredits: 199, amount: 590, currency: "TWD" as const },
  { id: "MEDIUM", label: "標準活動", attendeeRange: "200–599 人", attendeeCredits: 599, amount: 790, currency: "TWD" as const },
  { id: "LARGE", label: "大型活動", attendeeRange: "600–999 人", attendeeCredits: 999, amount: 990, currency: "TWD" as const }
] as const;

export const billingService = {
  listPricingTiers() {
    return pricingTiers;
  },

  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { attendeeCredits: true } });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "找不到使用者");
    return { attendeeCredits: user.attendeeCredits, recentPayments: [] };
  },

  createCheckoutSession(_userId: string, _tierId: string): never {
    throw new AppError(503, "BILLING_NOT_CONFIGURED", "付款功能尚未開放，請聯繫客服購買額度");
  }
};
