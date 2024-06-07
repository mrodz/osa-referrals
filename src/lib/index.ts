// place files you want to import through the `$lib` alias in this folder.

import type { UserInfo } from "firebase/auth";
import { writable } from "svelte/store";

const realAuthStore = writable<{
	isLoggedIn: boolean;
	user?: UserInfo;
	firebaseControlled: boolean;
}>({
	isLoggedIn: false,
	firebaseControlled: false
});

export const authStore = {
	subscribe: realAuthStore.subscribe,
	set: realAuthStore.set
};