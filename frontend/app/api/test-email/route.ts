import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend inside the handler to prevent build-time errors if env var is missing
export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { to = 'mauguerrero96@gmail.com' } = await request.json();

        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [to],
            subject: 'Hello World',
            html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
