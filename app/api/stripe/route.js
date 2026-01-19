import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { amount, currency = "usd", metadata = {} } = await req.json();

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("Stripe secret key missing");
            return NextResponse.json(
                { error: "Stripe is not configured" },
                { status: 500 }
            );
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert to cents
            currency,
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Stripe error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
