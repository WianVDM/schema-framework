// NOTE: ImportMeta augmentation for bundler-injected env variables.
// All major bundlers (Vite, Webpack, Rollup) support import.meta.env.
// This avoids adding @types/node as a dependency in the library package.

interface ImportMetaEnv {
	readonly DEV: boolean;
	readonly PROD: boolean;
	readonly MODE: string;
	readonly SSR: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
