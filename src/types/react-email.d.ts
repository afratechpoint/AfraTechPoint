// Fallback type declarations for @react-email/components
// This ensures that even if local NPM installation fails or has peer-dependency mismatches, the Next.js build will not crash.

declare module "@react-email/components" {
  export const Body: any;
  export const Container: any;
  export const Head: any;
  export const Html: any;
  export const Img: any;
  export const Preview: any;
  export const Section: any;
  export const Tailwind: any;
  export const Text: any;
  export const Button: any;
  export const Column: any;
  export const Row: any;
  export const Hr: any;
  export const Link: any;
}

declare module "@react-email/render" {
  export const render: any;
}
