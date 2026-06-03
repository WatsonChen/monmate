import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const eventRepository = {
  list(userId?: string) {
    return prisma.event.findMany({
      where: userId ? { createdById: userId } : undefined,
      orderBy: { startAt: "desc" },
      include: {
        _count: {
          select: { attendees: true, checkInLogs: true }
        }
      }
    });
  },

  findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attendees: true, checkInLogs: true }
        }
      }
    });
  },

  findBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        content: true,
        registrationRequired: true,
        startAt: true,
        endAt: true,
        location: true
      }
    });
  },

  create(data: Prisma.EventUncheckedCreateInput) {
    return prisma.event.create({ data });
  },

  update(id: string, data: Prisma.EventUncheckedUpdateInput) {
    return prisma.event.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.event.delete({ where: { id } });
  }
};
