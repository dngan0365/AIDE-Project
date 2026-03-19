export interface UserInformation {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar_url?: string;
  favorite_culture?: string;
  preferred_language?: string;
}