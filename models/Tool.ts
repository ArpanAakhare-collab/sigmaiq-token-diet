import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITool extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: string[];
  description: string;
  features: string[];
  pricingTier: "free" | "freemium" | "paid";
  platforms: string[];
  officialUrl: string;
  rating: number;
  reviewSummary: string;
  createdAt: Date;
  updatedAt: Date;
}

const ToolSchema: Schema<ITool> = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    category: { type: [String], required: true, index: true },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    pricingTier: {
      type: String,
      enum: ["free", "freemium", "paid"],
      required: true,
      default: "freemium",
    },
    platforms: { type: [String], default: ["Web"] },
    officialUrl: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5, default: 4.5 },
    reviewSummary: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
ToolSchema.index({ name: "text", description: "text", features: "text" });

const Tool: Model<ITool> =
  mongoose.models.Tool || mongoose.model<ITool>("Tool", ToolSchema);

export default Tool;
