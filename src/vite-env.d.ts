/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [key: string]: string };
  export default content;
}

declare module "*.png" {
  const pngSrc: string;
  export default pngSrc;
}

declare module "*.jpg" {
  const jpgSrc: string;
  export default jpgSrc;
}

declare module "*.jpeg" {
  const jpegSrc: string;
  export default jpegSrc;
}

declare module "*.gif" {
  const gifSrc: string;
  export default gifSrc;
}

declare module "*.svg" {
  const svgSrc: string;
  export default svgSrc;
}

declare module "*.webp" {
  const webpSrc: string;
  export default webpSrc;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
