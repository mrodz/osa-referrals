<script lang="ts">
  import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
  import { goto } from "$app/navigation";

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

  const signUp = async () => {
    try {
      const auth = getAuth();

      let [name, domain] = email.split("@", 2);

      const user = await createUserWithEmailAndPassword(
        auth,
        `${name}@${code()}.${domain}`,
        password
      );

      console.log(user);

	  alert(`You created a new account: ${user.user.email}`);

      goto("/dashboard");
    } catch (e) {
      if (e !== null && typeof e === "object" && "code" in e) {
        if (e.code === "auth/invalid-email") {
          alert("Could not create account: invalid email");
        } else if (e.code === "auth/internal-error") {
          alert("Bad code");
          console.error(e);
        } else {
          alert("Unknown error");
          console.error(e);
        }
      } else {
        alert("Could not create account");
        console.error(e);
      }
    }
  };
</script>

<section>
  <div
    class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
  >
    <div
      class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1
          class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white"
        >
          Create an account
        </h1>
        <form class="space-y-4 md:space-y-6" on:submit|preventDefault={signUp}>
          <div>
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Your email</label
            >
            <input
              bind:value={email}
              type="email"
              name="email"
              id="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label
              for="password"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Password</label
            >
            <input
              bind:value={password}
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              for="confirm-password"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Confirm password</label
            >
            <input
              bind:value={passwordConfirm}
              type="password"
              name="confirm-password"
              id="confirm-password"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div>
            <div
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              OSA Secret
            </div>
            <div class="flex mb-2 space-x-2 rtl:space-x-reverse items-center">
              <div>
                <label for="code-1" class="sr-only">First code</label>
                <input
                  bind:value={numberOne}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-next="code-2"
                  id="code-1"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-2" class="sr-only">Second code</label>
                <input
                  bind:value={numberTwo}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-1"
                  data-focus-input-next="code-3"
                  id="code-2"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-3" class="sr-only">Third code</label>
                <input
                  bind:value={numberThree}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-2"
                  data-focus-input-next="code-4"
                  id="code-3"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-4" class="sr-only">Fourth code</label>
                <input
                  bind:value={numberFour}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-3"
                  data-focus-input-next="code-5"
                  id="code-4"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-5" class="sr-only">Fifth code</label>
                <input
                  bind:value={numberFive}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-4"
                  data-focus-input-next="code-6"
                  id="code-5"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label for="code-6" class="sr-only">Sixth code</label>
                <input
                  bind:value={numberSix}
                  type="text"
                  maxlength="1"
                  on:keyup={numberKeyup}
                  data-focus-input-init
                  data-focus-input-prev="code-5"
                  id="code-6"
                  class="block w-9 h-9 py-3 text-sm font-extrabold text-center text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >Create an account</button
          >
          <p class="text-sm font-light text-gray-500 dark:text-gray-400">
            Already have an account? <a
              href="/login"
              class="font-medium text-primary-600 hover:underline dark:text-primary-500"
              >Login here</a
            >
          </p>
        </form>
      </div>
    </div>
  </div>
</section>
