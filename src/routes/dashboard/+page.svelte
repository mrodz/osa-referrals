<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib";
  import { onMount } from "svelte";
  import { getAuth } from "firebase/auth";

  let formResponse: Promise<FormResponse[]> | undefined;

  onMount(() => {
    if (!$authStore.isLoggedIn) {
      goto("/login");
      return;
    }

    const currentUser = getAuth().currentUser;

    if (currentUser === null) {
      alert("You aren't signed in");
      goto("/login");
      return;
    }

    formResponse = (async () => {
      const jwt = await currentUser.getIdToken();

      const response = await fetch(
        "http://127.0.0.1:5001/osa-software/us-central1/loadAllResponses",
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${jwt}`,
          },
        }
      );

      const object: FormResponse[] | { error: string } = await response.json();

      if (typeof object === "object" && "error" in object) {
        throw new Error(object.error);
      }

      if (!Array.isArray(object)) {
        throw new Error(JSON.stringify(object));
      }

      return object;
    })();

    formResponse.catch((e) => {
      console.error(e);
      alert("Could not load responses");
    });
  });

  let expanded: string | undefined;
</script>

{#if !$authStore.isLoggedIn}
  You can't access this page.
{:else}
  <div class="flex flex-col items-center px-6 py-8 mx-auto md:h-screen">
    <main class="w-full bg-white rounded-lg shadow p-4">
      <h1
        class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl mb-4"
      >
        Dashboard
      </h1>

      {#if formResponse === undefined}
        <p>Waiting for browser to send request...</p>
      {:else}
        {#await formResponse}
          <p>Loading resources...</p>
        {:then formResponse}
          {#if formResponse.length !== 0}
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table
                class="w-full text-sm text-left rtl:text-right text-gray-500 overflow-x-auto"
              >
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3"> Parent Email </th>
                    <th scope="col" class="px-6 py-3"> Parent Name </th>
                    <th scope="col" class="px-6 py-3"> Parent Phone </th>
                    <th scope="col" class="px-6 py-3"> Student Name </th>
                    <th scope="col" class="px-6 py-3"> Grade </th>
                    <th scope="col" class="px-6 py-3"> Reading </th>
                    <th scope="col" class="px-6 py-3"> Math </th>
                    <th scope="col" class="px-6 py-3"> School </th>
                    <th scope="col" class="px-6 py-3">
                      <span class="sr-only">View Application</span>
                    </th>
                    <th scope="col" class="px-6 py-3">
                      <span class="sr-only">Delete</span>
                    </th>
                    <th scope="col" class="px-6 py-3">
                      <span class="sr-only">Mark as Completed</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#each formResponse as response}
                    <tr class="bg-white border-b hover:bg-gray-50">
                      <th
                        scope="row"
                        class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {response.data.parent.email}
                      </th>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {response.data.parent.name}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {response.data.parent.phone}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {response.data.child.name}
                      </td>
                      <td class="px-6 py-4 w-[1%]">
                        {#if response.data.child.grade === 0}
                          K
                        {:else}
                          {response.data.child.grade}
                        {/if}
                      </td>
                      <td class="px-6 py-4 w-[1%]">
                        {#if response.data.reading}
                          <span class="text-green-500">Yes</span>
                        {:else}
                          <span class="text-red-500">No</span>
                        {/if}
                      </td>
                      <td class="px-6 py-4 w-[1%]">
                        {#if response.data.math}
                          <span class="text-green-500">Yes</span>
                        {:else}
                          <span class="text-red-500">No</span>
                        {/if}
                      </td>
                      <td class="px-6 py-4 w-[1%] whitespace-nowrap">
                        {response.data.child.school}
                      </td>
                      <td class="px-6 py-4 text-right w-[1%]">
                        <button
                          class="btn whitespace-nowrap"
                          on:click={() =>
                            (expanded =
                              expanded === response.id
                                ? undefined
                                : response.id)}
                        >
                          {#if expanded === response.id}
                            Collapse
                          {:else}
                            Expand
                          {/if}
                        </button>
                      </td>
                      <td class="px-6 py-4 text-right w-[1%]">
                        <button class="btn-err whitespace-nowrap">
                          Delete
                        </button>
                      </td>
                      <td class="px-6 py-4 text-right w-[1%]">
                        <button class="btn-ok whitespace-nowrap">
                          Mark as Completed
                        </button>
                      </td>
                    </tr>
                    {#if expanded === response.id}
                      <div class="mx-4">
                        <section>
                          <header class="text-md">
                            &rsaquo; In response to: "Tell us about your child and your situation" 
                          </header>
                          {response.data.story}
                        </section>
                        <section>
                          <header class="text-md">
                            &rsaquo; Date submitted 
                          </header>
                          {new Date(response.data.uploaded)}
                        </section>
                      </div>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p>No responses recorded.</p>
          {/if}
        {/await}
      {/if}
    </main>
  </div>
{/if}
