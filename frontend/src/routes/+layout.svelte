<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pb } from '$lib/pb';
	import { userStore } from '$lib/stores/user.svelte';
	import { notificationStore } from '$lib/stores/notifications.svelte';
	import { browser } from '$app/environment';
	import { Toaster } from '$lib/components/ui/sonner';
	import SEO from '$lib/components/SEO.svelte';

	let { data, children }: { data: any, children: any } = $props();

	// Update userStore if data.user changes (from server)
	$effect(() => {
		if (data.user) {
			userStore.user = {
				id: data.user.id,
				email: data.user.email,
				name: data.user.name || data.user.username || 'User',
				avatar: data.user.avatar ? pb.getFileUrl(data.user, data.user.avatar) : undefined
			};
			// Fetch notifications when user is logged in
			if (browser) {
				notificationStore.fetchNotifications();
			}
		} else {
			userStore.user = null;
		}
	});

	if (browser) {
		// Sync PocketBase auth store with the cookie/server state
		pb.authStore.loadFromCookie(document.cookie);
		pb.authStore.onChange((token, model) => {
			document.cookie = pb.authStore.exportToCookie({ httpOnly: false, path: '/', sameSite: 'Lax' });
		});
	}
</script>

<SEO />
<Toaster position="bottom-right" richColors />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
