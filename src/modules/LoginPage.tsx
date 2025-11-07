// File: LoginPage.tsx
import React, { useState } from "react";
import PageLayout from "../components/Auth/AuthPageLayout";
import LoginForm from "../components/Auth/LoginForm";
import OtpForm from "../components/Auth/OtpForm";

const LoginPage: React.FC = () => {
  // Form state management
  const [formState, setFormState] = useState<"login" | "otp">("login");

  return (
    <PageLayout>
      {formState === "login" ? (
        <LoginForm onSubmit={() => setFormState("otp")} />
      ) : (
        <OtpForm onBack={() => setFormState("login")} />
      )}
    </PageLayout>
  );
};

export default LoginPage;
