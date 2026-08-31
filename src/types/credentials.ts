export interface Credentials {
  openrouterKey: string;
  tempoToken: string;
  accountId: string;
  jiraDomain: string;
  jiraEmail: string;
  jiraToken: string;
  /** Groq model ID. Empty string means use the service's default. */
  model?: string;
}
