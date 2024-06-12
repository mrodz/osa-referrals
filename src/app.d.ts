// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace grecaptcha {
		declare function getResponse(widgetId?: number): any
	}

	declare interface FormResponse {
		id: string;
		data: {
			child: {
				name: string;
				teacher: string;
				school: string;
				grade: 0 | 1 | 2 | 3 | 4 | 5;
			};
			parent: {
				name: string;
				email: string;
				phone: string;
			};
			math: boolean;
			reading: boolean;
			story: string;
			uploaded: string;
			completed: boolean;
			completedAt: string | undefined | "Never";
			reducedLunch: boolean;
			relationship: 0 | 1 | 2 | 3;
		}
	}
}

export { };
