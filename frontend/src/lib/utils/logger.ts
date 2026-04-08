import { pb } from '$lib/pb';

export async function logError(error: any, context: Record<string, any> = {}) {
    console.error('Logging error to PocketBase:', error, context);
    
    try {
        const data = {
            errorId: context.errorId || crypto.randomUUID(),
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : (typeof error === 'object' ? JSON.stringify(error) : String(error)),
            type: context.type || 'error',
            timestamp: new Date().toISOString(),
            context: JSON.stringify(context),
            url: typeof window !== 'undefined' ? window.location.href : 'server-side',
            user: pb.authStore.model?.id || null,
        };

        // We use the regular pb instance. 
        // Note: The 'system_logs' collection must allow 'create' for authenticated users (or public if needed)
        await pb.collection('system_logs').create(data);
    } catch (e) {
        // Fallback to console if PocketBase logging fails
        console.error('CRITICAL: Failed to log error to PocketBase:', e);
    }
}
