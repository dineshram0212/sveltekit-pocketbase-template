import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import type { TypedPocketBase } from '$lib/types/pocketbase-types';

export const PB_URL = import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090';

// This is the client-side singleton
export const pb = new PocketBase(PB_URL) as TypedPocketBase;

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
    console.log('authStore changed', auth);
    currentUser.set(pb.authStore.model);
});
