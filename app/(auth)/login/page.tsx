import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Home Inventory</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Sign in</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
