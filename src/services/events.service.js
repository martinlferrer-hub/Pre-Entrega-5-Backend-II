import mongoose from "mongoose";
import { eventsRepository } from "../repositories/events.repository.js";

const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const eventsService = {
  async getPublishedEvents() {
    return eventsRepository.getPublished();
  },

  async createEvent(data, user) {
    const { title, description, date, location, capacity } = data;

    if (!title || !description || !date || !location || capacity === undefined) {
      throw createError("Faltan campos obligatorios del evento", 400);
    }

    if (!mongoose.isValidObjectId(user.id)) {
      throw createError("Usuario autenticado inválido", 400);
    }

    return eventsRepository.create({
      title: title.trim(),
      description: description.trim(),
      date,
      location: location.trim(),
      capacity,
      status: "published",
      organizer: user.id
    });
  },

  async updateEvent(id, data, user) {
    if (!mongoose.isValidObjectId(id)) {
      throw createError("Evento no encontrado", 404);
    }

    const event = await eventsRepository.findById(id);

    if (!event) {
      throw createError("Evento no encontrado", 404);
    }

    const isAdmin = user.role === "admin";
    const isOwner = event.organizer?.toString() === user.id;

    if (!isAdmin && !isOwner) {
      throw createError("No tenés permisos para modificar este evento", 403);
    }

    const allowedFields = ["title", "description", "date", "location", "capacity", "status"];
    const updates = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = typeof data[field] === "string" ? data[field].trim() : data[field];
      }
    }

    return eventsRepository.updateById(id, updates);
  }
};
