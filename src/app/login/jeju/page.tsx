import { LoginForm } from "@/components/login-form";
import { DIOCESES } from "@/config/dioceses";

export default function JejuLoginPage() {
  return <LoginForm diocese={DIOCESES.jeju} />;
}
