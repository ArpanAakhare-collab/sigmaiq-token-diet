import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFavorite extends Document {
  _id: mongoose.Types.ObjectId;
  uid: string;
  toolId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const FavoriteSchema: Schema<IFavorite> = new Schema({
  uid: { type: String, required: true, index: true },
  toolId: { type: Schema.Types.ObjectId, ref: "Tool", required: true },
  savedAt: { type: Date, default: Date.now },
});

// Compound unique index to prevent duplicate favorites per user
FavoriteSchema.index({ uid: 1, toolId: 1 }, { unique: true });

const Favorite: Model<IFavorite> =
  mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);

export default Favorite;
