import type { HandleClientError } from '@sveltejs/kit';
import { logError } from '$lib/utils/logger';

export const handleError: HandleClientError = async ({ error, event }) => {
    const errorId = crypto.randomUUID();

    // Log to PocketBase
    await logError(error, {
        errorId,
        url: event.url.toString(),
        type: 'client_error'
    });

    return {
        message: 'Something went wrong in the browser.',
        errorId
    };
};
