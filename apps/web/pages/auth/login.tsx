import { useRouter } from "next/router";

import Layout from "app/core/layouts/Layout";
import { LoginForm } from "app/auth/components/LoginForm";

function LoginPage() {
  const router = useRouter();

  return (
    <Layout title="Log In">
      <LoginForm
        onSuccess={(_user) => {
          const next = router.query.next
            ? decodeURIComponent(router.query.next as string)
            : "/";
          return router.push(next);
        }}
      />
    </Layout>
  );
}

export default LoginPage;
