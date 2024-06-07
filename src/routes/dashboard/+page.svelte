<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib";
  import { onMount } from "svelte";

  onMount(() => {
    if (!$authStore.isLoggedIn) {
      goto("/login");
    }
  });
</script>

{#if !$authStore.isLoggedIn}
  You can't access this page.
{:else}
<div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
  <main
    class="w-full bg-white rounded-lg shadow dark:border md:mt-0 xl:p-0 dark:bg-gray-800 dark:border-gray-700"
  >
    <h1
      class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
    >
      Dashboard
    </h1>
  </main>
  </div>
{/if}
