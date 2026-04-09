import { PB_URL } from '$lib/pb';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '$lib/types/pocketbase-types';

export const handle: Handle = async ({ event, resolve }) => {
    // Create a new PocketBase instance for each request
    const pb = new PocketBase(PB_URL) as TypedPocketBase;

    // Authenticate based on the cookie
    const cookie = event.request.headers.get('cookie') || '';
    pb.authStore.loadFromCookie(cookie);

    try {
        // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
        if (pb.authStore.isValid) {
            await pb.collection('users').authRefresh();
            event.locals.user = pb.authStore.model;
        } else {
            event.locals.user = null;
        }
    } catch (_) {
        // clear the auth store on failed refresh
        pb.authStore.clear();
        event.locals.user = null;
    }

    event.locals.pb = pb;

    const response = await resolve(event);

    // send back the newly created cookie to the client
    // Note: Use httpOnly: true for better security unless you specifically need to read it on the client
    response.headers.append('set-cookie', pb.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax', path: '/' }));

    return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
    const pb = event.locals.pb;
    const errorId = crypto.randomUUID();

    if (pb) {
        try {
            // Only attempt to log if we're not already in an error loop
            // and maybe check if the collection exists (though that's an extra hop)
            await pb.collection('system_logs').create({
                errorId,
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : null,
                url: event.url.toString(),
                method: event.request.method,
                user: event.locals.user?.id || null,
                type: 'server_error',
                timestamp: new Date().toISOString(),
            });
        } catch (e: any) {
            // Silently fail or log a simpler message if the logging collection doesn't exist
            if (e.status !== 404) {
                console.error('Failed to log server error to PocketBase:', e.message);
            }
        }
    }

    return {
        message: 'Something went wrong on the server.',
        errorId
    };
};
