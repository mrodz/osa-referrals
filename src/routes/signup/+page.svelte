<script lang="ts">
  import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { PUBLIC_CODE_QUEUE_URL } from "$env/static/public";

  function numberKeyup(this: HTMLInputElement) {
    const prevId = this.getAttribute("data-focus-input-prev");
    const nextId = this.getAttribute("data-focus-input-next");

    if (this.value.length === 0) {
      if (prevId) {
        document.getElementById(prevId)?.focus();
      }
    } else {
      if (nextId) {
        document.getElementById(nextId)?.focus();
      }
    }
  }

  let email: string;
  let password: string;
  let passwordConfirm: string;
  let numberOne: string;
  let numberTwo: string;
  let numberThree: string;
  let numberFour: string;
  let numberFive: string;
  let numberSix: string;

  const code = () => {
    const combined =
      numberOne + numberTwo + numberThree + numberFour + numberFive + numberSix;
    if (Number.isSafeInteger(Number(combined))) {
      return combined;
    }
    return combined.replaceAll(/[^0-9]/, "");
  };

  let disabled = false;

  const signUp = async () => {
    disabled = true;

    if (password !== passwordConfirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      const auth = getAuth();

      const url = new URL(PUBLIC_CODE_QUEUE_URL);
      url.searchParams.set("email", email);
      url.searchParams.set("code", code());

      await fetch(url, {
        mode: "no-cors",
      });

      const user = await createUserWithEmailAndPassword(auth, email, password);

      console.log(user);

      alert(`You created a new account: ${user.user.email}`);

      goto("/dashboard");
    } catch (e) {
      if (e !== null && typeof e === "object" && "code" in e) {
        console.error(e);
        switch (e.code) {
          case "auth/invalid-email":
            alert("Could not create account: invalid email");
            break;
          case "auth/internal-error":
            alert("Bad code");
            break;
          case "auth/email-already-in-use":
            alert("This email is already in use");
            break;
          case "auth/too-many-requests":
            alert("We are receiving high volumes of traffic right now. Please try again later.");
            break;
          default:
            alert("Unknown error");
        }
      } else {
        alert("Could not create account");
        console.error(e);
      }
    } finally {
      disabled = false;
    }
  };
</script>

<section>
  <div
    class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
  >
    <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
      <div
        class="p-6 space-y-4 md:space-y-6 sm:p-8"
        style={disabled ? "opacity: 0.5" : ""}
      >
        <h1
          class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl"
        >
          Create an account
        </h1>
        <form class="space-y-4 md:space-y-6" on:submit|preventDefault={signUp}>
          <div>
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900"
              >Your email</label
            >
            <input
              {disabled}
              bind:value={email}
              type="email"
              name="email"
              autocomplete="email"
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
              {disabled}
              bind:value={password}
              type="password"
              name="password"
              autocomplete="new-password"
              id="password"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              for="confirm-password"
              class="block mb-2 text-sm font-medium text-gray-900"
              >Confirm password</label
            >
            <input
              {disabled}
              bind:value={passwordConfirm}
              type="password"
              name="confirm-password"
              autocomplete="new-password"
              id="confirm-password"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              required
            />
          </div>
          <div>
            <div class="block mb-2 text-sm font-medium text-gray-900">
              OSA Secret
            </div>
            <div class="flex mb-2 space-x-2 rtl:space-x-reverse items-center">
              <div>
                <label for="code-1" class="sr-only">First code</label>
                <input
                  {disabled}
                  bind:value={numberOne}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-next="code-2"
                  id="code-1"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-2" class="sr-only">Second code</label>
                <input
                  {disabled}
                  bind:value={numberTwo}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-1"
                  data-focus-input-next="code-3"
                  id="code-2"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-3" class="sr-only">Third code</label>
                <input
                  {disabled}
                  bind:value={numberThree}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-2"
                  data-focus-input-next="code-4"
                  id="code-3"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-4" class="sr-only">Fourth code</label>
                <input
                  {disabled}
                  bind:value={numberFour}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-3"
                  data-focus-input-next="code-5"
                  id="code-4"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-5" class="sr-only">Fifth code</label>
                <input
                  {disabled}
                  bind:value={numberFive}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-4"
                  data-focus-input-next="code-6"
                  id="code-5"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-6" class="sr-only">Sixth code</label>
                <input
                  {disabled}
                  bind:value={numberSix}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-5"
                  id="code-6"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>
          <button
            {disabled}
            type="submit"
            class="w-full bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {#if disabled}
              Creating account...
            {:else}
              Create an account
            {/if}
          </button>
          {#if !disabled}
            <p class="text-sm font-light text-gray-500">
              Already have an account? <a
                href="/login"
                class="font-medium text-primary-600 hover:underline"
                >Login here</a
              >
            </p>
          {/if}
        </form>
      </div>
    </div>
  </div>
</section>
