"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe2, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useResetPassword } from "@/features/auth/hooks/use-auth";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const resetPassword = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenParam,
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password") || "";

  const passwordChecks = [
    { label: "At least 8 characters", valid: passwordVal.length >= 8 },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(passwordVal) },
    { label: "At least one lowercase letter", valid: /[a-z]/.test(passwordVal) },
    { label: "At least one number", valid: /[0-9]/.test(passwordVal) },
  ];

  const onSubmit = (data: ResetPasswordValues) => {
    resetPassword.mutate({
      token: data.token,
      password: data.password,
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
              <Globe2 className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#0F172A]">GlobeTrotter</span>
          </Link>

          <h1 className="text-3xl font-bold text-[#0F172A]">Set new password</h1>
          <p className="mt-2 text-[#64748B]">
            Your new password must be different from previous passwords.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            {!tokenParam && (
              <div>
                <label htmlFor="token" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                  Reset Token
                </label>
                <input
                  id="token"
                  type="text"
                  placeholder="Paste your reset token"
                  className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.token ? "border-[#DC2626]" : "border-[#E2E8F0]"
                  }`}
                  {...register("token")}
                />
                {errors.token && (
                  <p className="mt-1.5 text-xs text-[#DC2626]">{errors.token.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.password ? "border-[#DC2626]" : "border-[#E2E8F0]"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#0F172A]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#DC2626]">{errors.password.message}</p>
              )}

              {/* Password complexity checklist */}
              {passwordVal.length > 0 && (
                <div className="mt-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs space-y-1.5">
                  <p className="font-semibold text-[#0F172A] mb-1">Password requirements:</p>
                  {passwordChecks.map((chk) => (
                    <div key={chk.label} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`size-3.5 ${
                          chk.valid ? "text-[#16A34A]" : "text-[#94A3B8]"
                        }`}
                      />
                      <span className={chk.valid ? "text-[#16A34A] font-medium" : "text-[#64748B]"}>
                        {chk.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.confirmPassword ? "border-[#DC2626]" : "border-[#E2E8F0]"
                  }`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#0F172A]"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-[#DC2626]">{errors.confirmPassword.message}</p>
              )}
            </div>

            {resetPassword.isError && (
              <div
                className="flex items-start gap-2.5 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3.5 text-sm text-[#DC2626]"
                role="alert"
              >
                <AlertCircle className="mt-0.5 size-4.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Reset failed</p>
                  <p className="text-xs text-[#DC2626]/90 mt-0.5">{resetPassword.error.message}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              {resetPassword.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Updating password...
                </span>
              ) : (
                "Reset password"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="size-4" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right — Hero image */}
      <div className="hidden bg-[#F1F5F9] lg:flex lg:flex-1 lg:items-center lg:justify-center">
        <div className="relative h-full w-full overflow-hidden">
          <img
            src="/images/hero.jpg"
            alt="Beautiful travel destination"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-[#0F172A]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              Secure Account
            </span>
            <h2 className="mt-4 text-3xl font-bold">Secure your travel plans</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed opacity-90">
              Pick a strong, unique password to keep your travel itineraries and preferences safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
