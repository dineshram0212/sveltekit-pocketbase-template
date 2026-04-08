import { pb } from '$lib/pb';

// types for email options
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Sends an email using either PocketBase's internal SMTP or Resend API.
 * The choice is determined by the 'EMAIL_PROVIDER' environment variable or a default.
 */
export async function sendEmail(options: EmailOptions) {
    const provider = process.env.EMAIL_PROVIDER || 'pocketbase'; // 'pocketbase' or 'resend'
    
    if (provider === 'resend' && process.env.RESEND_API_KEY) {
        return await sendWithResend(options);
    } else {
        return await sendWithPocketBase(options);
    }
}

async function sendWithPocketBase(options: EmailOptions) {
    // Note: PocketBase's standard SDK doesn't expose a generic 'sendMail' method.
    // It usually sends emails for specific actions (verification, password reset).
    // To send custom emails, you typically use a PocketBase hook (Go/JS) or 
    // connect to the SMTP server directly.
    
    // However, for this task, we will assume we want to use PocketBase's 
    // configured SMTP settings if possible, or fallback to a custom implementation.
    
    console.log('Sending email via PocketBase SMTP:', options.subject, 'to', options.to);
    
    // Placeholder for PocketBase SMTP logic
    // In a real scenario, you might have a custom PocketBase route or hook
    // that accepts these parameters and sends the mail using $app.newMailClient().send(...)
    
    try {
        // If we want to trigger a PocketBase system email, we'd use pb.collection('users').requestPasswordReset...
        // For custom emails, we might need a dedicated collection 'emails' which has a hook to send.
        await pb.collection('system_emails').create({
            to: options.to,
            subject: options.subject,
            html: options.html,
            status: 'pending'
        });
        return { success: true };
    } catch (e) {
        console.error('Failed to queue email in PocketBase:', e);
        throw e;
    }
}

async function sendWithResend(options: EmailOptions) {
    console.log('Sending email via Resend:', options.subject, 'to', options.to);
    
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: options.to,
                subject: options.subject,
                html: options.html,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Resend API error: ${JSON.stringify(error)}`);
        }

        return await response.json();
    } catch (e) {
        console.error('Failed to send email via Resend:', e);
        throw e;
    }
}
