import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormData) => {
    const { error } = await signIn.email(data);
    if (error) {
      toast.error(error.message ?? "Failed to sign in");
    } else {
      toast.success("Signed in successfully");
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("email", { required: true })}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password", { required: true })}
              />
            </Field>

            <Button type="submit" disabled={isSubmitting} className="w-full h-10">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              className="text-primary font-medium hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
