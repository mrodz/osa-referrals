<script lang="ts">
  import { authStore } from "$lib";
  import { goto } from "$app/navigation";
</script>

<div class="h-full w-full ">
  {#if $authStore.isLoggedIn}
    {JSON.stringify($authStore.user)}
  {:else}
  {/if}
</div>
