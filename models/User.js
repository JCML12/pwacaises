import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: "user" },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

