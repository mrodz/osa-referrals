<script lang="ts">
  import { goto } from "$app/navigation";
  import { PUBLIC_RECORD_RESPONSE_URL } from "$env/static/public";
  import { page } from "$app/stores";

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
  let relationship: 0 | 1 | 2 | 3;
  let freeLunch: boolean;

  let submitting: boolean = false;

  const validate = () => {
    if (typeof relationship !== "number")
      throw new Error("Please fill out your relationship to the child");
    if (typeof childSchool !== "string")
      throw new Error("Please select the child's school");
    if (typeof childGrade !== "number")
      throw new Error("Please select the child's grade");
    if (
      (typeof wantsMath !== "boolean" && typeof wantsReading !== "boolean") ||
      (!wantsMath && !wantsReading)
    )
      throw new Error(
        "Please select the field the child should be mentored in"
      );
    if (typeof freeLunch !== "boolean")
      throw new Error(
        "Please select whether the child qualifies for Free or Reduced Lunch"
      );
  };

  const onSubmit = async () => {
    try {
      validate();
    } catch (e) {
      if (e !== null && typeof e === "object" && "message" in e) {
        alert(e.message);
      }
      console.error(e);
      return;
    }

    const captchaObject = grecaptcha.getResponse();

    if (typeof captchaObject !== "string" || captchaObject.length === 0) {
      alert("Please confirm that you are not a robot");
      return;
    }

    submitting = true;

    try {
      const x = await fetch(PUBLIC_RECORD_RESPONSE_URL, {
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
          reducedLunch: freeLunch,
          relationship,
        }),
      });
      console.log(x);
      alert(
        "Your response was recorded! We will write you via email within the next few business days; please check your inbox."
      );

      const isEmbedded = $page.url.searchParams.has("embed");

      goto(`/thanks/${isEmbedded ? "?embed" : ""}`);
    } catch (e) {
      console.error(e);
    } finally {
      submitting = false;
    }
  };
</script>

<svelte:head>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

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
      class="block mb-2 text-sm font-medium text-gray-900">Phone number:</label
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
        pattern="[0-9]{'{10}'}"
        placeholder="123-456-7890"
        required
      />
    </div>
  </div>

  <hr class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10" />

  <div class="mb-5">
    <label
      for="relationship"
      class="block mb-2 text-sm font-medium text-gray-900"
    >
      Relationship to child
    </label>

    <fieldset id="relationship">
      <legend class="sr-only">Relationship to child</legend>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (relationship = 0)}
          name="relationship"
          id="relationship-option-1"
          type="radio"
          value="Family"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="relationship-option-1"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          I am a family member
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (relationship = 1)}
          name="relationship"
          id="relationship-option-2"
          type="radio"
          value="Teacher"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="relationship-option-2"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          I am a teacher
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (relationship = 2)}
          name="relationship"
          id="relationship-option-3"
          type="radio"
          value="School Resource Officer"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="relationship-option-3"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          I am a school resource officer
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (relationship = 3)}
          name="relationship"
          id="relationship-option-4"
          type="radio"
          value="Other"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="relationship-option-4"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          I am someone else
        </label>
      </div>
    </fieldset>
  </div>

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
    <fieldset id="school">
      <legend class="sr-only">Child's school</legend>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (childSchool = "El Marino")}
          name="school"
          id="school-option-1"
          type="radio"
          value="El Marino"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="school-option-1"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          El Marino
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (childSchool = "El Rincon")}
          name="school"
          id="school-option-2"
          type="radio"
          value="El Rincon"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="school-option-2"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          El Rincon
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (childSchool = "La Ballona")}
          name="school"
          id="school-option-3"
          type="radio"
          value="La Ballona"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="school-option-3"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          La Ballona
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (childSchool = "Linwood Howe")}
          name="school"
          id="school-option-4"
          type="radio"
          value="Linwood Howe"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="school-option-4"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          Linwood Howe
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (childSchool = "Farragut")}
          name="school"
          id="school-option-5"
          type="radio"
          value="Farragut"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="school-option-5"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          Farragut
        </label>
      </div>
    </fieldset>
  </div>

  <div class="mb-5">
    <label for="grade" class="block mb-2 text-sm font-medium text-gray-900">
      Child's grade (2nd-5th)
    </label>
    <fieldset id="grade">
      <legend class="sr-only">Child's Grade</legend>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (childGrade = 2)}
          name="grade"
          id="grade-option-3"
          type="radio"
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
          name="grade"
          id="grade-option-4"
          type="radio"
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
          name="grade"
          id="grade-option-5"
          type="radio"
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
          name="grade"
          id="grade-option-6"
          type="radio"
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
    <label for="interest" class="block mb-2 text-sm font-medium text-gray-900">
      {#if relationship === 0}
        My
      {:else}
        The
      {/if}
      student needs help in (select all that apply)
    </label>
    <fieldset id="interest">
      <legend class="sr-only">Checkbox variants</legend>

      <div class="flex items-center mb-4">
        <input
          bind:checked={wantsMath}
          id="checkbox-2"
          type="checkbox"
          value="Reading"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label for="checkbox-2" class="ms-2 text-sm font-medium text-gray-900">
          Math
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          bind:checked={wantsReading}
          id="checkbox-3"
          type="checkbox"
          value="Reading"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label for="checkbox-3" class="ms-2 text-sm font-medium text-gray-900">
          Reading
        </label>
      </div>
    </fieldset>
  </div>

  <div class="mb-5">
    <label for="grade" class="block mb-2 text-sm font-medium text-gray-900">
      Does

      {#if relationship === 0}
        your
      {:else}
        this
      {/if}

      child qualify for
      <a
        class="text-blue-700 underline"
        target="_blank"
        href="https://www.cde.ca.gov/ls/nu/sn/cauniversalmeals.asp"
        rel="noopener noreferrer">Free or Reduced Lunch</a
      >?
    </label>

    <fieldset id="grade">
      <legend class="sr-only">Free or reduced qualifications</legend>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (freeLunch = true)}
          name="lunch"
          id="lunch-option-1"
          type="radio"
          value="yes"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="lunch-option-1"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          Yes
        </label>
      </div>

      <div class="flex items-center mb-4">
        <input
          on:click={() => (freeLunch = false)}
          name="lunch"
          id="lunch-option-2"
          type="radio"
          value="no"
          class="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
        />
        <label
          for="lunch-option-2"
          class="block ms-2 text-sm font-medium text-gray-900"
        >
          No
        </label>
      </div>
    </fieldset>
  </div>

  <div class="mb-5">
    <label for="message" class="block mb-2 text-sm font-medium text-gray-900">
      Tell us about
      {#if relationship === 0}
        your
      {:else}
        the
      {/if}
      child and situation (max 500 characters)
    </label>
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
    disabled={submitting}
    type="submit"
    class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
  >
    {#if submitting}
      Please wait...
    {:else}
      Submit
    {/if}
  </button>
</form>
