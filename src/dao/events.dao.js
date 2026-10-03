import { EventModel } from "../models/Event.js";

export const eventsDao = {
  async findPublished() {
    return EventModel.find({ status: "published" })
      .select("title description date location capacity status organizer")
      .lean();
  },

  async create(eventData) {
    return EventModel.create(eventData);
  },

  async findById(id) {
    return EventModel.findById(id);
  },

  async updateById(id, eventData) {
    return EventModel.findByIdAndUpdate(id, eventData, {
      new: true,
      runValidators: true
    });
  }
};
