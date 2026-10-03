import { eventsService } from "../services/events.service.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getPublishedEvents();

    res.status(200).json({
      status: "success",
      payload: events
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent(req.body, req.user);

    res.status(201).json({
      status: "success",
      payload: {
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        organizer: event.organizer.toString()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.body, req.user);

    res.status(200).json({
      status: "success",
      payload: {
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        status: event.status,
        organizer: event.organizer.toString()
      }
    });
  } catch (error) {
    next(error);
  }
};
