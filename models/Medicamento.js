import mongoose from "mongoose";

const MedicamentoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  presentacion: { type: String, required: true },
  via: { type: String, required: true },
  lote: { type: String, required: true },
  caducidad: { type: String, required: true },
  stock: { type: Number, required: true },
  codigo: { type: String, required: true },
});

export default mongoose.models.Medicamento ||
  mongoose.model("Medicamento", MedicamentoSchema);
