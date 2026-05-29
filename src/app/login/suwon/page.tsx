import { LoginForm } from "@/components/login-form";
import { DIOCESES } from "@/config/dioceses";

export default function SuwonLoginPage() {
  return <LoginForm diocese={DIOCESES.suwon} />;
}
