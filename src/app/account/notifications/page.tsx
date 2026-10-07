import { redirect } from "next/navigation";

export default function AccountNotificationsRedirect() {
  redirect("/account?tab=notifications");
}
