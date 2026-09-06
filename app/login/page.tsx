import AuthForm from "./auth-form";

export const metadata = { title: "ログイン・新規登録", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-[calc(100vh-180px)] place-items-center px-5 py-16">
      <AuthForm />
    </main>
  );
}
