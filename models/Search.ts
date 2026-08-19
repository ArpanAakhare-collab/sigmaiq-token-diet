import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISearch extends Document {
  _id: mongoose.Types.ObjectId;
  uid?: string | null;
  queryText: string;
  parsedJson: Record<string, any>;
  resultSummary?: {
    count: number;
    topResultName?: string;
  };
  createdAt: Date;
}

const SearchSchema: Schema<ISearch> = new Schema({
  uid: { type: String, default: null, index: true },
  queryText: { type: String, required: true },
  parsedJson: { type: Schema.Types.Mixed, required: true },
  resultSummary: {
    count: { type: Number, default: 0 },
    topResultName: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
});

// Index for fetching search history ordered newest first
SearchSchema.index({ uid: 1, createdAt: -1 });

const Search: Model<ISearch> =
  mongoose.models.Search || mongoose.model<ISearch>("Search", SearchSchema);

export default Search;
