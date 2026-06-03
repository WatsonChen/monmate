import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler";
import { ok } from "../lib/http";
import { requireAuth } from "../middlewares/auth";
import { billingService } from "../services/billing.service";

export const billingRouter = Router();

billingRouter.use(requireAuth);

billingRouter.get(
  "/pricing-tiers",
  asyncHandler(async (_req, res) => {
    return ok(res, billingService.listPricingTiers());
  })
);

billingRouter.get(
  "/status",
  asyncHandler(async (req, res) => {
    const status = await billingService.getStatus(req.user!.id);
    return ok(res, status);
  })
);

billingRouter.post(
  "/checkout-session",
  asyncHandler(async (req, res) => {
    const { tierId } = z.object({ tierId: z.string().min(1) }).parse(req.body);
    const session = billingService.createCheckoutSession(req.user!.id, tierId);
    return ok(res, session, 201);
  })
);
