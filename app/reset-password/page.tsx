import type { Metadata } from "next";
import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = { title: "パスワード再設定", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return <main className="grid min-h-[calc(100vh-180px)] place-items-center px-5 py-16"><ResetPasswordForm /></main>;
}
