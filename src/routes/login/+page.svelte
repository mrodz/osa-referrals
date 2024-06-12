<script lang="ts">
  import { goto } from "$app/navigation";
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import { authStore } from "$lib";

  $: if ($authStore.isLoggedIn) {
    goto("/dashboard");
  }

  let email: string;
  let password: string;

  const onSubmit = async () => {
    const captchaObject = grecaptcha.getResponse();

    if (typeof captchaObject !== "string" || captchaObject.length === 0) {
      alert("Please confirm that you are not a robot");
      return;
    }

    const auth = getAuth();

    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log(user);
      goto("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Could not sign you in");
    }
  };
</script>

<svelte:head>
	<script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

<section>
  <div
    class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
  >
    <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1
          class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl"
        >
          Sign in to the panel
        </h1>
        <form
          class="space-y-4 md:space-y-6"
          on:submit|preventDefault={onSubmit}
        >
          <div>
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900"
              >Your email</label
            >
            <input
              bind:value={email}
              autocomplete="email"
              type="email"
              name="email"
              id="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label
              for="password"
              class="block mb-2 text-sm font-medium text-gray-900"
              >Password</label
            >
            <input
              bind:value={password}
              type="password"
              name="password"
              id="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              required
            />
          </div>
          <div class="flex justify-center">
            <div
              class="g-recaptcha"
              data-sitekey="6LfIg_MpAAAAAEdV_qC4D8twNrHyjJ9-qVYUNsT9"
            ></div>
          </div>
          <button
            type="submit"
            class="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >Sign in</button
          >
          <p class="text-sm font-light text-gray-500">
            Don't have an account yet?
            <a
              href="/signup"
              class="font-medium text-primary-600 hover:underline"
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
    <div class="mt-4">
      If you want to request information or refer your child to One Step Ahead,
      you can do so
      <a class="font-medium text-primary-600 hover:underline" href="/">here</a>.
    </div>
  </div>
</section>
