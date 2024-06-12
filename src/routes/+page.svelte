<script lang="ts">
  import { authStore } from "$lib";
  import { page } from "$app/stores";
  import Form from "./Form.svelte";
</script>

<div class="overflow-auto flex flex-col items-center mb-8">
  <h1 class="h1 text-center my-8">Submit a Referral</h1>

  {#if $authStore.isLoggedIn}
    <div class="rounded-lg shadow bg-yellow-400 m-8 p-8">
      Hello! You are currently signed in as an administrator. You can still fill
      out referrals here, but you may view responses by visiting
      <a class="btn" href="/dashboard"> The Dashboard </a>
    </div>
  {/if}

  <section class="m-4 sm:max-w-md">
    We rely primarily on the Site-Based Instructional Leads from Farragut, La
    Ballona, El Marino, Lin Howe, and El Rincon to refer students who are best
    fit for our program. We accept students on a rolling basis, prioritizing
    students who are most socioeconomically disadvantaged, and/or have parents
    that never graduated high school. If you would like to refer a student who
    has not yet been offered the opportunity to join the program, or if you
    would like to advocate for a student receiving immediate attention, please
    follow the instructions below:
  </section>

  <hr class="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10" />

  {#if $page.url.searchParams.has("embed")}
    <Form />
  {:else}
    <section
      id="selection-tray"
      class="w-full grid grid-cols-1 min-[700px]:grid-cols-2 gap-2 lg:gap-8 mb-8"
    >
      <div class="flex flex-col items-center">
        <a href="/teachers" class="bg-blue-100 hover:bg-blue-400">
          <header class="text-center font-bold">
            Teachers and Administrators
          </header>
        </a>
        <p>
          Please contact your school's Site-Based Instructional Lead and ask
          them to refer the student you have in mind to our program. If you
          school does not currently have a Site-Based Instructional Lead or if
          you are unable to contact them, please click above
        </p>
      </div>
      <div class="flex flex-col items-center">
        <a href="/parents" class="bg-yellow-100 hover:bg-yellow-400">
          <header class="text-center font-bold">Parents</header>
        </a>
        <p>
          Please contact your student's teacher and ask them to refer your
          student to our program. If your teacher doesn't respond or has not
          been connected to their school's Site-Based Instructional Lead and our
          program, please click above
        </p>
      </div>
    </section>
  {/if}
</div>

<style>
  #selection-tray a {
    border-radius: 0.5rem;
    padding: 4rem;
    margin: 2rem 8rem;
    width: 50%;
  }

  #selection-tray p {
    width: 50%;
    margin: 0 auto;
  }

  @media screen and (max-width: 1000px) {
    #selection-tray a {
      margin: 2rem 4rem;
      width: 70%;
    }
    #selection-tray p {
      width: 70%;
    }
  }
</style>
