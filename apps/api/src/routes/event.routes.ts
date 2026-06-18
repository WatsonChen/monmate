import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/async-handler";
import { ok } from "../lib/http";
import { requireAuth } from "../middlewares/auth";
import { eventService } from "../services/event.service";
import { prisma } from "../lib/prisma";

export const eventRouter = Router();

const createEventSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  registrationRequired: z.boolean().optional(),
  openRegistration: z.boolean().optional(),
  startAt: z.string().min(1),
  endAt: z.string().optional(),
  location: z.string().optional()
});

const updateEventSchema = createEventSchema.partial().extend({
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
  location: z.string().nullable().optional()
});

eventRouter.get(
  "/public/:slug",
  asyncHandler(async (req, res) => {
    const event = await eventService.getPublicBySlug(req.params.slug);
    return ok(res, event);
  })
);

eventRouter.get(
  "/ticket/:slug",
  asyncHandler(async (req, res) => {
    const { token } = z.object({ token: z.string() }).parse(req.query);
    const event = await eventService.getPublicBySlug(req.params.slug);
    const attendee = await prisma.attendee.findFirst({
      where: { eventId: event.id, qrToken: token },
      select: { id: true, name: true, checkInCode: true, qrToken: true, checkInStatus: true }
    });
    return ok(res, { event, attendee });
  })
);

const publicRegisterSchema = z.object({
  name: z.string().min(1, "請填寫姓名"),
  phone: z.string().min(6, "請填寫電話")
});

eventRouter.post(
  "/public/:slug/register",
  asyncHandler(async (req, res) => {
    const { name, phone } = publicRegisterSchema.parse(req.body);
    const event = await eventService.getPublicBySlug(req.params.slug);

    if (!event.openRegistration) {
      const { AppError } = await import("../lib/http");
      throw new AppError(403, "REGISTRATION_CLOSED", "此活動未開放公開報名");
    }

    const existing = await prisma.attendee.findFirst({
      where: { eventId: event.id, phone: phone.trim() },
      select: { qrToken: true }
    });
    if (existing) return ok(res, { qrToken: existing.qrToken });

    const { randomBytes } = await import("node:crypto");
    const checkInCode = `MM${String(Date.now()).slice(-4)}0001`;
    const qrToken = randomBytes(18).toString("base64url");

    const attendee = await prisma.attendee.create({
      data: { eventId: event.id, name: name.trim(), phone: phone.trim(), checkInCode, qrToken },
      select: { qrToken: true }
    });
    return ok(res, { qrToken: attendee.qrToken }, 201);
  })
);

eventRouter.use(requireAuth);

eventRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const events = await eventService.list(req.user!.id);
    return ok(res, events);
  })
);

eventRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createEventSchema.parse(req.body);
    const event = await eventService.create({ ...body, createdById: req.user!.id });
    return ok(res, event, 201);
  })
);

eventRouter.get(
  "/:eventId",
  asyncHandler(async (req, res) => {
    const event = await eventService.get(req.params.eventId);
    return ok(res, event);
  })
);

eventRouter.patch(
  "/:eventId",
  asyncHandler(async (req, res) => {
    const body = updateEventSchema.parse(req.body);
    const event = await eventService.update(req.params.eventId, body);
    return ok(res, event);
  })
);

eventRouter.delete(
  "/:eventId",
  asyncHandler(async (req, res) => {
    const result = await eventService.delete(req.params.eventId);
    return ok(res, result);
  })
);

eventRouter.post(
  "/:eventId/invite",
  asyncHandler(async (req, res) => {
    const { template } = z.object({
      template: z.enum(["with-registration", "without-registration"])
    }).parse(req.body);

    const event = await eventService.get(req.params.eventId);
    const attendees = await prisma.attendee.findMany({
      where: { eventId: req.params.eventId },
      select: { name: true, phone: true, qrToken: true }
    });

    const webUrl = process.env.WEB_APP_URL?.replace(/\/$/, "") ?? "https://monmate.vercel.app";

    for (const a of attendees) {
      const ticketUrl = template === "with-registration"
        ? `${webUrl}/event/${event.slug}/ticket?token=${a.qrToken}`
        : `${webUrl}/event/${event.slug}/ticket?token=${a.qrToken}`;
      console.log(`[SMS mock] To: ${a.phone} | ${a.name} | ${event.name} | ${ticketUrl}`);
    }

    return ok(res, { sent: attendees.length, failed: 0 });
  })
);
