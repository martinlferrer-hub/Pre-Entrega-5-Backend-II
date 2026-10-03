import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El título del evento es obligatorio."],
      trim: true
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria."],
      trim: true
    },
    date: {
      type: Date,
      required: [true, "La fecha del evento es obligatoria."]
    },
    location: {
      type: String,
      required: [true, "La ubicación del evento es obligatoria."],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, "La capacidad del evento es obligatoria."],
      min: [1, "La capacidad debe ser mayor a 0."]
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "published"
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const EventModel = model("events", eventSchema);
