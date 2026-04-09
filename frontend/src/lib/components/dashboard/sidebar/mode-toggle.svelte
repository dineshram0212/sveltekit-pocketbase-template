<script lang="ts">
  import { HugeiconsIcon } from "@hugeicons/svelte";
  import { Sun, Moon } from "@hugeicons/core-free-icons";
  import { mode, setMode } from "mode-watcher";

  function updateMode(newMode: "light" | "dark", e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMode(newMode);
  }
</script>

<div
	class="flex h-8 w-fit items-center gap-1 rounded-full border border-input/20 bg-muted/50 p-1 shadow-inner pointer-events-auto cursor-default"
>
	<button
		type="button"
		class="relative flex h-6 w-9 cursor-pointer items-center justify-center rounded-full outline-none transition-all duration-200
               {mode.current === 'light'
			? 'bg-background text-foreground shadow-sm'
			: 'text-muted-foreground'}"
		onclick={(e) => updateMode("light", e)}
		aria-label="Light mode"
	>
		<HugeiconsIcon icon={Sun} class="size-4 pointer-events-none" />
	</button>
	<button
		type="button"
		class="relative flex h-6 w-9 cursor-pointer items-center justify-center rounded-full outline-none transition-all duration-200
               {mode.current === 'dark'
			? 'bg-background text-foreground shadow-sm'
			: 'text-muted-foreground'}"
		onclick={(e) => updateMode("dark", e)}
		aria-label="Dark mode"
	>
		<HugeiconsIcon icon={Moon} class="size-4 pointer-events-none" />
	</button>
</div>

