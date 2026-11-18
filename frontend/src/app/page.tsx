import { redirect } from "next/navigation";

export default function Home() {
  // Let the workspace provider restore the session from the HttpOnly cookie.
  redirect("/dashboard");
}
