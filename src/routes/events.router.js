import { Router } from "express";
import { getEvents, createEvent, updateEvent } from "../controllers/events.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

// Eventos publicados: consulta pública.
router.get("/", getEvents);

// Crear eventos: organizer o admin.
router.post("/", auth, authorize("organizer", "admin"), createEvent);

// Modificar eventos: primero autenticación/rol; luego el service valida propiedad.
router.put("/:id", auth, authorize("organizer", "admin"), updateEvent);

export default router;
