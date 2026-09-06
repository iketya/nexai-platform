import type { Metadata } from "next";
import UpdatePasswordForm from "./update-password-form";

export const metadata: Metadata = { title: "新しいパスワード", robots: { index: false, follow: false } };

export default function UpdatePasswordPage() {
  return <main className="grid min-h-[calc(100vh-180px)] place-items-center px-5 py-16"><UpdatePasswordForm /></main>;
}
