import { eventsDao } from "../dao/events.dao.js";

export const eventsRepository = {
  async getPublished() {
    return eventsDao.findPublished();
  },

  async create(eventData) {
    return eventsDao.create(eventData);
  },

  async findById(id) {
    return eventsDao.findById(id);
  },

  async updateById(id, eventData) {
    return eventsDao.updateById(id, eventData);
  }
};
