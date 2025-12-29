// Global type declarations for production build
declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
};

declare module 'path' {
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
}

declare module 'url' {
  export function fileURLToPath(url: string | URL): string;
}
