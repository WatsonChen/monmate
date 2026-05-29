import { createSlug } from "@monmate/utils";
import { AppError } from "../lib/http";
import { eventRepository } from "../repositories/event.repository";

export const eventService = {
  list() {
    return eventRepository.list();
  },

  async get(eventId: string) {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "找不到活動");
    }

    return event;
  },

  async getPublicBySlug(slug: string) {
    const event = await eventRepository.findBySlug(slug);

    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "找不到活動");
    }

    return {
      ...event,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt?.toISOString() ?? null
    };
  },

  create(input: {
    name: string;
    slug?: string;
    description?: string;
    startAt: string;
    endAt?: string;
    location?: string;
    createdById: string;
  }) {
    const slug = input.slug?.trim() || createSlug(input.name);

    return eventRepository.create({
      name: input.name,
      slug,
      description: input.description,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : undefined,
      location: input.location,
      createdById: input.createdById
    });
  },

  async update(
    eventId: string,
    input: Partial<{
      name: string;
      slug: string;
      description: string | null;
      startAt: string;
      endAt: string | null;
      location: string | null;
    }>
  ) {
    await this.get(eventId);

    return eventRepository.update(eventId, {
      ...input,
      startAt: input.startAt ? new Date(input.startAt) : undefined,
      endAt:
        input.endAt === null
          ? null
          : input.endAt
            ? new Date(input.endAt)
            : undefined
    });
  },

  async delete(eventId: string) {
    await this.get(eventId);
    await eventRepository.delete(eventId);
    return { id: eventId };
  }
};
