import { defineConfig } from 'cypress';

export default defineConfig({
	e2e: {
		setupNodeEvents(
			__on: Cypress.PluginEvents,
			__config: Cypress.PluginConfigOptions
		) {
			// implement node event listeners here
		},
	},
});
