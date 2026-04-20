import { LoginForm } from "@/components/login-form";
import { DIOCESES } from "@/config/dioceses";

export default function IncheonLoginPage() {
  return <LoginForm diocese={DIOCESES.incheon} />;
}
