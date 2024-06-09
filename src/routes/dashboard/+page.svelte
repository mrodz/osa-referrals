<script context="module" lang="ts">
  let formResponse: Promise<FormResponse[] | null> | undefined;
  let lastQuery: Date | undefined;
</script>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib";
  import { onMount } from "svelte";
  import { getAuth } from "firebase/auth";
  import {
    PUBLIC_LOAD_ALL_RESPONSES_URL,
    PUBLIC_MARK_RESPONSE_COMPLETED_URL,
    PUBLIC_DELETE_RESPONSE_URL,
  } from "$env/static/public";

  let jwt: string | undefined;

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

    if (
      lastQuery === undefined ||
      new Date().getTime() - lastQuery.getTime() > 30000
    ) {
      formResponse = (async () => {
        jwt = await currentUser.getIdToken();

        const response = await fetch(PUBLIC_LOAD_ALL_RESPONSES_URL, {
          method: "GET",
          headers: {
            authorization: `Bearer ${jwt}`,
          },
        });

        const object: FormResponse[] | { error: string } =
          await response.json();

        if (typeof object === "object" && "error" in object) {
          throw new Error(object.error);
        }

        if (!Array.isArray(object)) {
          throw new Error(JSON.stringify(object));
        }

        return object;
      })()
        .catch((e) => {
          console.error(e);
          alert("Could not load responses");
          return null;
        })
        .finally(() => {
          lastQuery = new Date();
          return null;
        });
    } else {
      console.log("Using cached data");
    }
  });

  let expanded: string | undefined;

  const markCompleted = async (documentId: string) => {
    if (pendingCompletionIds.has(documentId)) {
      return;
    }

    pendingCompletionIds.add(documentId);
    pendingCompletionIds = pendingCompletionIds;

    try {
      const response = await fetch(PUBLIC_MARK_RESPONSE_COMPLETED_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          id: documentId,
        }),
      });

      pendingCompletionIds = pendingCompletionIds;

      const object = await response.json();

      if (typeof object === "object" && "error" in object) {
        throw new Error(JSON.stringify(object));
      }

      formResponse = formResponse?.then?.((formResponses) => {
        if (formResponses === null) {
          return null;
        }

        return formResponses.map((response) => {
          if (response.id === documentId) {
            response.data.completed = object.completed;
            response.data.completedAt = object?.completedAt;
          }

          return response;
        });
      });
    } catch (e) {
      alert("Could not mark response as completed");
      console.error(e);
    } finally {
      pendingCompletionIds.delete(documentId);
    }
  };

  const onDeletion = async (r: FormResponse) => {
    if (
      !confirm(
        `Permanently deleting ${r.data.parent.email}'s response, are you sure you wish to proceed?`
      )
    ) {
      return;
    }

    pendingDeletionIds.add(r.id);

    try {
      const response = await fetch(PUBLIC_DELETE_RESPONSE_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          id: r.id,
        }),
      });

      const object = await response.json();
      console.log(object);

      if (typeof object === "object" && "error" in object) {
        throw new Error(JSON.stringify(object));
      }

      formResponse = formResponse?.then((formResponse) =>
        formResponse?.filter?.((response) => response.id !== r.id) ?? null
      );
    } catch (e) {
      alert("Could not delete response");
      console.error(e);
    } finally {
      pendingDeletionIds.delete(r.id);
    }
  };

  let pendingCompletionIds = new Set();
  let pendingDeletionIds = new Set();
</script>

{#if !$authStore.isLoggedIn}
  You can't access this page.
{:else}
  <div class="flex flex-col items-center px-6 py-8 mx-auto h-screen mb-8">
    <main class="w-full bg-white rounded-lg shadow p-4 h-full mb-8">
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
          {#if formResponse === null}
            <p>
              Could not resolve form responses.
            </p>
          {:else if formResponse.length ?? 0 !== 0}
            <div
              class="relative overflow-x-auto shadow-md sm:rounded-lg h-full"
            >
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
                    <tr
                      class="bg-white border-b hover:bg-gray-50 {response.data
                        .completed || pendingCompletionIds.has(response.id)
                        ? 'complete'
                        : 'incomplete'}"
                    >
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
                        <button
                          class="btn-err whitespace-nowrap"
                          on:click={() => onDeletion(response)}
                        >
                          {#if pendingDeletionIds.has(response.id)}
                            Deleting...
                          {:else}
                            Delete
                          {/if}
                        </button>
                      </td>
                      <td class="px-6 py-4 text-right w-[1%]">
                        <button
                          class="btn-ok whitespace-nowrap"
                          on:click={() => markCompleted(response.id)}
                        >
                          {#if pendingCompletionIds.has(response.id)}
                            Please wait
                          {:else if response.data.completed}
                            Revoke Completion
                          {:else}
                            Mark as Completed
                          {/if}
                        </button>
                      </td>
                    </tr>
                    {#if expanded === response.id}
                      <div
                        class="max-w-max md:max-w-2xl mx-auto absolute bg-white left-1/2 -translate-x-1/2 border-x-4 border-b-4 p-4 [&>section]:my-4"
                      >
                        <section>
                          <header class="text-md">
                            &rsaquo; In response to: "Tell us about your child
                            and your situation"
                          </header>
                          {response.data.story}
                        </section>
                        <section>
                          <header class="text-md">
                            &rsaquo; Date submitted
                          </header>
                          {new Date(response.data.uploaded)}
                        </section>
                        <section>
                          <header class="text-md">&rsaquo; Unique ID</header>
                          {response.id}
                        </section>
                        <section>
                          <header class="text-md">&rsaquo; Completed At</header>
                          {response.data.completedAt ?? "Never"}
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
        {:catch}
          <p>Error loading responses.</p>
        {/await}
      {/if}
    </main>
  </div>
{/if}

<style>
  .incomplete {
    background-color: #f5f242;
  }

  .incomplete:hover {
    background-color: #e3e2a3;
  }
</style>
