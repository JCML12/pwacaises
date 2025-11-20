import { connectDB } from "@/lib/mongodb";
import Medicamento from "@/models/Medicamento";

export async function GET() {
    await connectDB();
    const meds = await Medicamento.find();
    return Response.json(meds);
}

export async function POST(req) {
    await connectDB();
    const data = await req.json();
    const nuevo = await Medicamento.create(data);
    return Response.json(nuevo, { status: 201 });
}
