/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the NestJS contact service, e.g. https://contact-api.vercel.app
   *
   * When this is unset the contact form is not rendered at all and the Contact
   * section falls back to mailto only — the brief forbids a form that posts
   * nowhere, so there is no third state.
   */
  readonly VITE_CONTACT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
