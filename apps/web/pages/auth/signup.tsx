import { useRouter } from "next/router";
import { Routes } from "@blitzjs/next";

import Layout from "app/core/layouts/Layout";
import { SignupForm } from "app/auth/components/SignupForm";

function SignupPage() {
  const router = useRouter();

  return (
    <Layout title="Sign Up">
      <SignupForm onSuccess={() => router.push(Routes.Home())} />
    </Layout>
  );
}

export default SignupPage;
