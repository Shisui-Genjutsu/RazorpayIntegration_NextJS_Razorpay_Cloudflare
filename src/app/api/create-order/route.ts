import { NextResponse, NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Razorpay from "razorpay";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
    const { env } = getCloudflareContext();
    const razorpay = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
    });

    try {
        // Get amount from request body
        const { amount } = await request.json() as { amount: number };

        // Validate amount
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: "Invalid amount" },
                { status: 400 }
            );
        }

        const order = await razorpay.orders.create({
            amount: amount, // amount in paise (sent from frontend)
            currency: "INR",
            receipt: "receipt_" + nanoid(8)
        });

        return NextResponse.json({ order, orderId: order.id }, { status: 200 });
    } catch (error) {
        console.log("Error creating order: ", error);
        return NextResponse.json({ error: "Error creating order" }, { status: 500 });
    }
}
