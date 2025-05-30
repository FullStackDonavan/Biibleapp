<script setup lang="ts">
import { ref } from "@vue/reactivity";
import { registerWithEmail } from "~/composables/useAuth";
import type { Ref } from "vue";

const email: Ref<string> = ref("");
const password: Ref<string> = ref("");
const firstName: Ref<string> = ref("");
const lastName: Ref<string> = ref("");
const username: Ref<string> = ref("");
const phone: Ref<string> = ref("");

const errors: Ref<Map<string, { message: InputValidation }> | undefined> = ref(
  new Map<string, { message: InputValidation }>()
);
let response: FormValidation;

async function postRegisterForm() {
  response = await registerWithEmail(
    username.value,
    firstName.value,
    lastName.value,
    phone.value,
    email.value,
    password.value
  );
  errors.value = response.errors;
}
</script>

<template>
  <PatternSection>
    <div class="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <div class="lg:flex mt-10">
          <Icon name="mdi:compass-rose"  class="h-16 md:h-20 w-auto text-white"  />
          <!-- <h1
            class="py-9 text-center text-5xl font-extrabold text-gray-900 dark:text-gray-400"
          >
            Donavan Jones
          </h1> -->
        </div>
        <div>
          <h2
            class="text-center text-3xl font-extrabold mt-5 text-gray-900 dark:text-white"
          >
            Sign Up
          </h2>
        </div>
        <div
          v-if="response?.hasErrors && errors"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-3"
          role="alert"
        >
          <ul class="block sm:inline">
            <li v-for="[key, value] in errors" :key="key">
              {{ value.message }}
            </li>
          </ul>
        </div>
        <form
          v-on:submit.prevent
          class="mt-8 space-y-6"
          action="#"
          method="POST"
        >
          <input type="hidden" name="remember" value="true" />
          <div class="rounded-md shadow-sm -space-y-px mb-1">
            <div>
              <label for="firstName" class="sr-only">First Name</label>
              <input
                v-model="firstName"
                id="firstName"
                name="firstName"
                required
                class="appearance-none dark:bg-slate-500 dark:text-white dark:placeholder-white rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                :class="errors?.has('firstName') ? ' border-red-500' : ''"
                placeholder="First Name"
              />
            </div>
          </div>
          <div class="rounded-md shadow-sm -space-y-px mb-1">
            <div>
              <label for="lastName" class="sr-only">Last Name</label>
              <input
                v-model="lastName"
                id="lastName"
                name="lastName"
                required
                class="appearance-none dark:bg-slate-500 dark:text-white dark:placeholder-white rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                :class="errors?.has('lastName') ? ' border-red-500' : ''"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div class="rounded-md shadow-sm -space-y-px mb-1">
            <div>
              <label for="phone" class="sr-only">Phone</label>
              <input
                type="phone"
                v-model="phone"
                id="phone"
                name="phone"
                required
                class="dark:bg-slate-500 dark:text-white dark:placeholder-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                :class="errors?.has('phone') ? ' border-red-500' : ''"
                placeholder="phone"
              />
            </div>
          </div>
          <div class="rounded-md shadow-sm -space-y-px mb-1">
            <div>
              <label for="email-address" class="sr-only">Username</label>
              <input
                type="email"
                v-model="username"
                id="username"
                name="username"
                required
                class="dark:bg-slate-500 dark:text-white dark:placeholder-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                :class="errors?.has('username') ? ' border-red-500' : ''"
                placeholder="username"
              />
            </div>
          </div>

          <div class="rounded-md shadow-sm -space-y-px mb-1">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input
                v-model="email"
                id="email-address"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="dark:bg-slate-500 dark:text-white dark:placeholder-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                :class="errors?.has('email') ? ' border-red-500' : ''"
                placeholder="Email address"
              />
            </div>
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="dark:bg-slate-500 dark:text-white dark:placeholder-white appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="errors?.has('password') ? ' border-red-500' : ''"
              placeholder="Password"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <a
                href="#"
                class="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div></div>
        </form>
        <button
          @click.prevent="postRegisterForm"
          class="mt-5 group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span class="absolute left-0 inset-y-0 flex items-center pl-3">
            <!-- Heroicon name: solid/lock-closed -->
            <svg
              class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          Register
        </button>
      </div>
    </div>
  </PatternSection>
</template>
