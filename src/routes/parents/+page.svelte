<script lang="ts">
  import { goto } from "$app/navigation";

  let parentName: string;
  let parentEmail: string;
  let parentPhone: string;
  let childName: string;
  let childSchool: string;
  let childGrade: number = 0;
  let childTeacher: string;
  let wantsReading: boolean;
  let wantsMath: boolean;
  let story: string;

  const onSubmit = async () => {
    const captchaObject = grecaptcha.getResponse();

    if (typeof captchaObject !== "string" || captchaObject.length === 0) {
      alert("Please confirm that you are not a robot");
      return;
    }

    try {
      const x = await fetch(
        "http://127.0.0.1:5001/osa-software/us-central1/recordResponse",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            parent: {
              name: parentName,
              email: parentEmail,
              phone: parentPhone,
            },
            child: {
              name: childName,
              school: childSchool,
              grade: childGrade,
              teacher: childTeacher,
            },
            math: wantsMath ?? false,
            reading: wantsReading ?? false,
            story,
          }),
        }
      );
      console.log(x);
      alert(
        "Your response was recorded! We will write you via email within the next few business days; please check your inbox."
      );
      goto("/thanks");
    } catch (e) {
      console.error(e);
    }
  };
</script>

<svelte:head>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

<div>
  <h1 class="h1 my-4">Parents</h1>

  <form class="max-w-sm mx-auto mb-14" on:submit|preventDefault={onSubmit}>
    <div class="mb-5">
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900">
        Your name
      </label>
      <input
        bind:value={parentName}
        type="text"
        id="name"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="John Doe"
        required
      />
    </div>
    <div class="mb-5">
      <label for="email" class="block mb-2 text-sm font-medium text-gray-900">
        Your email
      </label>
      <input
        bind:value={parentEmail}
        type="email"
        id="email"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="your@email.com"
        required
      />
    </div>

    <div class="max-w-sm mx-auto">
      <label
        for="phone-input"
        class="block mb-2 text-sm font-medium text-gray-900"
        >Phone number:</label
      >
      <div class="relative">
        <div
          class="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none"
        >
          <svg
            class="w-4 h-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 19 18"
          >
            <path
              d="M18 13.446a3.02 3.02 0 0 0-.946-1.985l-1.4-1.4a3.054 3.054 0 0 0-4.218 0l-.7.7a.983.983 0 0 1-1.39 0l-2.1-2.1a.983.983 0 0 1 0-1.389l.7-.7a2.98 2.98 0 0 0 0-4.217l-1.4-1.4a2.824 2.824 0 0 0-4.218 0c-3.619 3.619-3 8.229 1.752 12.979C6.785 16.639 9.45 18 11.912 18a7.175 7.175 0 0 0 5.139-2.325A2.9 2.9 0 0 0 18 13.446Z"
            />
          </svg>
        </div>
        <input
          bind:value={parentPhone}
          type="tel"
          id="phone-input"
          aria-describedby="helper-text-explanation"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
          pattern="[0-9]{'{3}'}-[0-9]{'{3}'}-[0-9]{'{4}'}"
          placeholder="123-456-7890"
          required
        />
      </div>
    </div>

    <hr class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10" />

    <div class="mb-5">
      <label
        for="child-name"
        class="block mb-2 text-sm font-medium text-gray-900"
      >
        Child's name
      </label>
      <input
        bind:value={childName}
        type="text"
        id="child-name"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="John Doe Jr."
        required
      />
    </div>

    <div class="mb-5">
      <label for="school" class="block mb-2 text-sm font-medium text-gray-900">
        Child's school
      </label>

      <select
        bind:value={childSchool}
        name="school"
        id="school"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      >
        <option value="El Marino">El Marino</option>
        <option value="El Rincon">El Rincon</option>
        <option value="La Ballona">La Ballona</option>
        <option value="Linwood Howe">Linwood Howe</option>
        <option value="Farragut">Farragut</option>
      </select>
    </div>

    <div class="mb-5">
      <label for="grade" class="block mb-2 text-sm font-medium text-gray-900"
        >Child's grade</label
      >
      <fieldset id="grade">
        <legend class="sr-only">Child's Grades</legend>

        <div class="flex items-center mb-4">
          <input
            on:click={() => (childGrade = 0)}
            id="grade-option-1"
            type="radio"
            name="countries"
            value="Kindergarten"
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
            checked
          />
          <label
            for="grade-option-1"
            class="block ms-2 text-sm font-medium text-gray-900"
          >
            Kindergarten
          </label>
        </div>

        <div class="flex items-center mb-4">
          <input
            on:click={() => (childGrade = 1)}
            id="grade-option-2"
            type="radio"
            name="countries"
            value="First"
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
          />
          <label
            for="grade-option-2"
            class="block ms-2 text-sm font-medium text-gray-900"
          >
            First
          </label>
        </div>

        <div class="flex items-center mb-4">
          <input
            on:click={() => (childGrade = 2)}
            id="grade-option-3"
            type="radio"
            name="countries"
            value="Second"
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
          />
          <label
            for="grade-option-3"
            class="block ms-2 text-sm font-medium text-gray-900"
          >
            Second
          </label>
        </div>

        <div class="flex items-center mb-4">
          <input
            on:click={() => (childGrade = 3)}
            id="grade-option-4"
            type="radio"
            name="countries"
            value="Third"
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
          />
          <label
            for="grade-option-4"
            class="block ms-2 text-sm font-medium text-gray-900"
          >
            Third
          </label>
        </div>

        <div class="flex items-center mb-4">
          <input
            on:click={() => (childGrade = 4)}
            id="grade-option-5"
            type="radio"
            name="countries"
            value="Fourth"
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
          />
          <label
            for="grade-option-5"
            class="block ms-2 text-sm font-medium text-gray-900"
          >
            Fourth
          </label>
        </div>

        <div class="flex items-center mb-4">
          <input
            on:click={() => (childGrade = 5)}
            id="grade-option-6"
            type="radio"
            name="countries"
            value="Fifth"
            class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
          />
          <label
            for="grade-option-6"
            class="block ms-2 text-sm font-medium text-gray-900"
          >
            Fifth
          </label>
        </div>
      </fieldset>
    </div>

    <div class="mb-5">
      <label for="teacher" class="block mb-2 text-sm font-medium text-gray-900">
        Child's teacher
      </label>
      <input
        bind:value={childTeacher}
        type="text"
        id="teacher"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder="(eg) Sra. Campos"
        required
      />
    </div>

    <div class="mb-5">
      <label
        for="interest"
        class="block mb-2 text-sm font-medium text-gray-900"
      >
        My student needs help in (select all that apply)
      </label>
      <fieldset id="interest">
        <legend class="sr-only">Checkbox variants</legend>

        <div class="flex items-center mb-4">
          <input
            bind:checked={wantsMath}
            id="checkbox-2"
            type="checkbox"
            value=""
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="checkbox-2"
            class="ms-2 text-sm font-medium text-gray-900"
          >
            Math
          </label>
        </div>

        <div class="flex items-center mb-4">
          <input
            bind:checked={wantsReading}
            id="checkbox-3"
            type="checkbox"
            value=""
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label
            for="checkbox-3"
            class="ms-2 text-sm font-medium text-gray-900"
          >
            Reading
          </label>
        </div>
      </fieldset>
    </div>

    <div class="mb-5">
      <label for="message" class="block mb-2 text-sm font-medium text-gray-900"
        >Tell us about your child and your situation</label
      >
      <textarea
        bind:value={story}
        maxlength="500"
        id="message"
        rows="4"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Type your story here..."
      ></textarea>
    </div>

    <div
      class="g-recaptcha"
      data-sitekey="6LfIg_MpAAAAAEdV_qC4D8twNrHyjJ9-qVYUNsT9"
    ></div>

    <button
      type="submit"
      class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
    >
      Submit
    </button>
  </form>
</div>
