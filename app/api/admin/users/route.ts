import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .select("email name paymentStatus createdAt")
    .lean();

  return Response.json({
    users: users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      paymentStatus: u.paymentStatus,
      createdAt: u.createdAt,
    })),
  });
}
