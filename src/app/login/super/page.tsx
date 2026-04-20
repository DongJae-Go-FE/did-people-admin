import { LoginForm } from "@/components/login-form";
import { SUPER_CONFIG } from "@/config/dioceses";

export default function SuperLoginPage() {
  return <LoginForm diocese={SUPER_CONFIG} />;
}
