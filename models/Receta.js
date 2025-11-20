import mongoose from "mongoose";

const RecetaItemSchema = new mongoose.Schema(
  {
    medicamentoId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicamento", required: true },
    nombre: { type: String, required: true },
    presentacion: { type: String },
    via: { type: String },
    cantidad: { type: Number, required: true },
  },
  { _id: false }
);

const RecetaSchema = new mongoose.Schema(
  {
    items: { type: [RecetaItemSchema], required: true },
    totalMedicamentos: { type: Number, required: true },
  },
  {
    timestamps: true,
    collection: "recetas",
  }
);

export default mongoose.models.Receta || mongoose.model("Receta", RecetaSchema);

