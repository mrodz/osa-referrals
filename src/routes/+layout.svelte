<script lang="ts">
  import "../app.pcss";
  import { initializeApp } from "firebase/app";
  import {
    PUBLIC_FIREBASE_API_KEY,
    PUBLIC_FIREBASE_AUTH_DOMAIN,
    PUBLIC_FIREBASE_PROJECT_ID,
    PUBLIC_FIREBASE_STORAGE_BUCKET,
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    PUBLIC_FIREBASE_APP_ID,
  } from "$env/static/public";
  import { onMount } from "svelte";
  import {
    browserLocalPersistence,
    browserPopupRedirectResolver,
    initializeAuth,
    onAuthStateChanged,
    signOut,
    getAuth,
  } from "firebase/auth";
  import { authStore } from "$lib";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const firebaseConfig = {
    apiKey: PUBLIC_FIREBASE_API_KEY,
    authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: PUBLIC_FIREBASE_APP_ID,
  };

  onMount(() => {
    const firebaseApp = initializeApp(firebaseConfig);

    const firebaseAuth = initializeAuth(firebaseApp, {
      popupRedirectResolver: browserPopupRedirectResolver,
      persistence: browserLocalPersistence,
    });

    onAuthStateChanged(firebaseAuth, (user) => {
      authStore.set({
        isLoggedIn: user !== null,
        user: user ?? undefined,
        firebaseControlled: true,
      });
    });
  });

  const loginButton = () => {
    goto("/login");
  };

  const logoutButton = async () => {
    const auth = getAuth();
    await signOut(auth);
    goto("/");
  };
</script>

<div>
  {#if !$page.url.searchParams.has("embed")}
    <header
      class="bg-[#475a3e] grid grid-cols-[1fr_auto] items-center [&>*]:p-2"
    >
      <div class="text-white">
        <a href="/" class="text-2xl font-bold">
          One Step Ahead Referral Tracker &raquo;
        </a>
        {($page.route.id?.substring(1) ?? "") === ""
          ? "home"
          : $page.route.id?.substring(1)}
      </div>

      <div>
        {#if !$authStore.isLoggedIn}
          <button class="btn" on:click={loginButton}>
            <span class="hidden sm:block"> You are not signed in </span>
            <span class="block sm:hidden"> Sign in </span>
          </button>
        {:else}
          <button class="btn-empty" on:click={logoutButton}>
            Sign Out
            <span class="hidden sm:block">
              {$authStore?.user?.email ?? "Guest"}
            </span>
          </button>
        {/if}
      </div>
    </header>
  {/if}

  <slot />
</div>

<footer class="bottom-0 fixed bg-gray-200 w-full p-1">
  Made by Mateo Rodriguez (<a
    class="hover:underline"
    href="https://github.com/mrodz"
    target="_blank">GitHub</a
  >) &copy;2024
</footer>
