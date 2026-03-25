/// <reference types="vite/client" />

declare module '*.yml?raw' {
  const src: string;
  export default src;
}
