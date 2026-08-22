"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCurrentUser, useRegister } from "@/features/auth/hooks/use-auth";
import {
  type SignupFormValues,
  signupSchema,
} from "@/features/auth/schemas/auth.schema";

export default function SignupPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const { data: currentUser, isLoading: checkingAuth } = useCurrentUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = watch("password") || "";

  // Password requirement checks
  const passwordChecks = [
    { label: "At least 8 characters", valid: passwordVal.length >= 8 },
    {
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(passwordVal),
    },
    {
      label: "At least one lowercase letter",
      valid: /[a-z]/.test(passwordVal),
    },
    { label: "At least one number", valid: /[0-9]/.test(passwordVal) },
  ];

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (currentUser && !checkingAuth) {
      router.replace("/dashboard");
    }
  }, [currentUser, checkingAuth, router]);

  const onSubmit = (data: SignupFormValues) => {
    registerMutation.mutate({
      displayName: data.displayName,
      email: data.email,
      password: data.password,
    });
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white">
              <Globe2 className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#0F172A]">
              GlobeTrotter
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-[#0F172A]">
            Create your account
          </h1>
          <p className="mt-2 text-[#64748B]">
            Start building personalized multi-city travel itineraries.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            <div>
              <label
                htmlFor="displayName"
                className="mb-1.5 block text-sm font-medium text-[#0F172A]"
              >
                Full name
              </label>
              <input
                id="displayName"
                type="text"
                autoComplete="name"
                placeholder="Krish Patel"
                className={`h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  errors.displayName ? "border-[#DC2626]" : "border-[#E2E8F0]"
                }`}
                {...register("displayName")}
              />
              {errors.displayName && (
                <p className="mt-1.5 text-xs text-[#DC2626]">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-[#0F172A]"
              >
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
                <p className="mt-1.5 text-xs text-[#DC2626]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-[#0F172A]"
              >
                Password
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
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-[#DC2626]">
                  {errors.password.message}
                </p>
              )}

              {/* Password complexity checklist */}
              {passwordVal.length > 0 && (
                <div className="mt-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs space-y-1.5">
                  <p className="font-semibold text-[#0F172A] mb-1">
                    Password requirements:
                  </p>
                  {passwordChecks.map((chk) => (
                    <div key={chk.label} className="flex items-center gap-2">
                      <CheckCircle2
                        className={`size-3.5 ${
                          chk.valid ? "text-[#16A34A]" : "text-[#94A3B8]"
                        }`}
                      />
                      <span
                        className={
                          chk.valid
                            ? "text-[#16A34A] font-medium"
                            : "text-[#64748B]"
                        }
                      >
                        {chk.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-[#0F172A]"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className={`h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    errors.confirmPassword
                      ? "border-[#DC2626]"
                      : "border-[#E2E8F0]"
                  }`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#0F172A]"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-[#DC2626]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {registerMutation.isError && (
              <div
                className="flex items-start gap-2.5 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3.5 text-sm text-[#DC2626]"
                role="alert"
              >
                <AlertCircle className="mt-0.5 size-4.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Registration failed</p>
                  <p className="text-xs text-[#DC2626]/90 mt-0.5">
                    {registerMutation.error.message}
                  </p>
                  {registerMutation.error.fieldErrors && (
                    <ul className="mt-1.5 list-disc pl-4 text-xs space-y-0.5">
                      {Object.entries(registerMutation.error.fieldErrors).map(
                        ([field, msgs]) => (
                          <li key={field}>{msgs.join(", ")}</li>
                        ),
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Creating
                  account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#64748B]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
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
              Join GlobeTrotter
            </span>
            <h2 className="mt-4 text-3xl font-bold">
              Your next journey begins here
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed opacity-90">
              Create multi-city itineraries, discover catalog activities, and
              collaborate with ease.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
