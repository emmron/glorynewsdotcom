/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />

declare namespace App {
	interface Locals {
		// Add properties for server-side session/request data
		user?: {
			id: string;
			email: string;
		};
		session?: Record<string, any>;
	}

	interface PageData {
		// Add properties that will be available to all pages
		title?: string;
		meta?: {
			description?: string;
			keywords?: string[];
		};
	}

	interface Error {
		// Add custom error properties
		code?: number;
		message: string;
		details?: Record<string, any>;
	}

	interface Platform {
		// Add platform-specific properties
		env?: Record<string, string>;
		context?: Record<string, any>;
	}
}

export {};
