import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DIOCESES } from "@/config/dioceses";

export default function LoginPickerPage() {
  const options = [DIOCESES.incheon, DIOCESES.jeju, DIOCESES.suwon];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">DID DB Admin</CardTitle>
          <p className="text-sm text-muted-foreground">로그인할 교구를 선택하세요</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {options.map((opt) => (
            <Button key={opt.code} asChild variant="outline" className="w-full justify-start">
              <Link href={`/login/${opt.code}`}>{opt.name}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
