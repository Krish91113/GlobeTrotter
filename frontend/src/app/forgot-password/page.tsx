"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe2, Loader2, ArrowLeft, CheckCircle2, KeyRound, ArrowRight } from "lucide-react";
import { useForgotPassword } from "@/features/auth/hooks/use-auth";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    forgotPassword.mutate(data.email, {
      onSuccess: (res) => {
        setSubmittedEmail(data.email);
        if (res.resetToken) {
          setDevResetToken(res.resetToken);
        }
      },
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

          {submittedEmail ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                <CheckCircle2 className="size-7" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-[#0F172A]">Check your inbox</h1>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                If an account exists for <span className="font-semibold text-[#0F172A]">{submittedEmail}</span>, you will receive password reset instructions.
              </p>

              {devResetToken && (
                <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <KeyRound className="size-3.5" />
                    Reset Token
                  </div>
                  <p className="mt-1 text-xs text-[#64748B]">Click below to set your new password:</p>
                  <Link
                    href={`/reset-password?token=${devResetToken}`}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1D4ED8] transition-colors"
                  >
                    Set New Password <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <ArrowLeft className="size-4" /> Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Reset password</h1>
              <p className="mt-2 text-[#64748B]">
                Enter the email address associated with your account and we&apos;ll help you reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0F172A]">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      errors.email ? "border-[#DC2626]" : "border-[#E2E8F0]"
                    }`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-[#DC2626]">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotPassword.isPending}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  {forgotPassword.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Sending instructions...
                    </span>
                  ) : (
                    "Send reset instructions"
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
          )}
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
              Account Recovery
            </span>
            <h2 className="mt-4 text-3xl font-bold">Never lose track of your adventures</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed opacity-90">
              Recover access to all your saved trips, custom itineraries, and travel preferences securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
