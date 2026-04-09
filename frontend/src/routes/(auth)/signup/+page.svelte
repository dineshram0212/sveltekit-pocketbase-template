<script lang="ts">
	import { HugeiconsIcon } from "@hugeicons/svelte";
	import {
		ViewIcon,
		ViewOffIcon,
		Loading03Icon,
		InformationCircleIcon,
	} from "@hugeicons/core-free-icons";
	import google from "$lib/assets/logos/google.png";
	import { authClient } from "$lib/utils/auth";
	import { notify } from "$lib/stores/notifications.svelte.js";
	import { enhance } from "$app/forms";
	import SEO from "$lib/components/SEO.svelte";
	import type { ActionData } from "./$types";

	let { form }: { form: ActionData } = $props();

	let name = $state("");
	let email = $state("");
	let password = $state("");
	let passwordConfirm = $state("");
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let loading = $state(false);
	let googleLoading = $state(false);

	// Show toast on server-side error
	$effect(() => {
		if (form?.error) {
			notify.alert("Signup Failed", form.error);
		}
	});

	async function signupWithGoogle() {
		googleLoading = true;
		const { error: socialError } = await authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
		});

		if (socialError) {
			notify.alert("Google Sign In Failed", socialError.message || "Unknown error");
		}
		googleLoading = false;
	}
</script>

<SEO 
	title="Create Account" 
	description="Join Dead Stock Alert and start optimizing your inventory today." 
/>

<div class="relative space-y-7 pb-7">
	<div class="space-y-2">
		<h1 class="text-3xl tracking-tight text-foreground">Create account</h1>
	</div>

	<button
		type="button"
		onclick={signupWithGoogle}
		disabled={loading || googleLoading}
		class="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background/60 disabled:cursor-not-allowed disabled:opacity-60"
	>
		<img src={google} alt="Google" class="h-4 w-4" />
		{#if googleLoading}
			<HugeiconsIcon icon={Loading03Icon} size={16} class="animate-spin" />
			Redirecting...
		{:else}
			Continue with Google
		{/if}
	</button>

	<div class="relative text-center">
		<div
			class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
		></div>
		<span class="relative bg-muted px-3 text-xs text-muted-foreground">Or</span>
	</div>

	<form
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
		method="POST"
		class="space-y-5"
	>
		<div>
			<label for="name" class="text-[13px] font-medium text-muted-foreground"
				>Full name</label
			>
			<div
				class="relative mt-1 flex items-center border-b border-border pb-1.5 transition-colors focus-within:border-accent-primary"
			>
				<input
					id="name"
					name="name"
					type="text"
					autocomplete="name"
					bind:value={name}
					placeholder="Jane Doe"
					class="flex-1 border-none bg-transparent px-3 py-1.5 text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground"
					disabled={loading || googleLoading}
					required
				/>
			</div>
			{#if form?.error && !name}
				<p class="mt-1 text-xs text-red-500">Name is required</p>
			{/if}
		</div>

		<div>
			<label for="email" class="text-[13px] font-medium text-muted-foreground"
				>Email</label
			>
			<div
				class="relative mt-1 flex items-center border-b border-border pb-1.5 transition-colors focus-within:border-accent-primary"
			>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					bind:value={email}
					placeholder="name@example.com"
					class="flex-1 border-none bg-transparent px-3 py-1.5 text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground"
					disabled={loading || googleLoading}
					required
				/>
			</div>
			{#if form?.error && !email}
				<p class="mt-1 text-xs text-red-500">Email is required</p>
			{/if}
		</div>

		<div>
			<label
				for="password"
				class="text-[13px] font-medium text-muted-foreground">Password</label
			>
			<div
				class="relative mt-1 flex items-center border-b border-border pb-1.5 transition-colors focus-within:border-accent-primary"
			>
				<input
					id="password"
					name="password"
					type={showPassword ? "text" : "password"}
					autocomplete="new-password"
					bind:value={password}
					placeholder="Create a strong password"
					class="flex-1 border-none bg-transparent px-3 py-1.5 text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground"
					disabled={loading || googleLoading}
					required
				/>
				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					class="mr-1 cursor-pointer text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
					disabled={loading || googleLoading}
					aria-label={showPassword ? "Hide password" : "Show password"}
				>
					{#if showPassword}
						<HugeiconsIcon icon={ViewOffIcon} size={16} />
					{:else}
						<HugeiconsIcon icon={ViewIcon} size={16} />
					{/if}
				</button>
			</div>
			{#if form?.error && password.length < 8}
				<p class="mt-1 text-xs text-red-500">Password must be at least 8 characters</p>
			{/if}
		</div>

		<div>
			<label
				for="confirmPassword"
				class="text-[13px] font-medium text-muted-foreground"
				>Confirm password</label
			>
			<div
				class="relative mt-1 flex items-center border-b border-border pb-1.5 transition-colors focus-within:border-accent-primary"
			>
				<input
					id="confirmPassword"
					name="passwordConfirm"
					type={showConfirmPassword ? "text" : "password"}
					autocomplete="new-password"
					bind:value={passwordConfirm}
					placeholder="Re-enter your password"
					class="flex-1 border-none bg-transparent px-3 py-1.5 text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground"
					disabled={loading || googleLoading}
					required
				/>
				<button
					type="button"
					onclick={() => (showConfirmPassword = !showConfirmPassword)}
					class="mr-1 cursor-pointer text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
					disabled={loading || googleLoading}
					aria-label={showConfirmPassword
						? "Hide confirm password"
						: "Show confirm password"}
				>
					{#if showConfirmPassword}
						<HugeiconsIcon icon={ViewOffIcon} size={16} />
					{:else}
						<HugeiconsIcon icon={ViewIcon} size={16} />
					{/if}
				</button>
			</div>
			{#if form?.error && password !== passwordConfirm}
				<p class="mt-1 text-xs text-red-500">Passwords do not match</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={loading || googleLoading}
			class="flex w-full cursor-pointer items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if loading}
				<HugeiconsIcon
					icon={Loading03Icon}
					size={18}
					class="mr-2 animate-spin"
				/>
				Creating account...
			{:else}
				Create account
			{/if}
		</button>
	</form>

	<div
		class="flex w-full items-center justify-center gap-1 text-[13px] text-muted-foreground"
	>
		Already have an account? <a
			href="/login"
			class="hover:text-foreground underline underline-offset-2">Sign in</a
		>
	</div>

	<div
		class="pointer-events-none absolute right-0 bottom-0 left-0 flex h-4 items-center justify-center gap-1 overflow-hidden text-center text-xs text-red-600 transition-opacity"
		class:opacity-0={!form?.error}
	>
		<HugeiconsIcon icon={InformationCircleIcon} size={14} />
		<span class="truncate">{form?.error ?? ""}</span>
	</div>
</div>
