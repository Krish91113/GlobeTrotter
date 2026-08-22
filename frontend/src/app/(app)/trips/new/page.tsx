"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Loader2, MapPin, Sparkles } from "lucide-react";
import { differenceInCalendarDays, parseISO, isValid } from "date-fns";
import { createTripSchema, type CreateTripFormValues } from "@/schemas";
import { useCreateTrip, useLocations, useCurrencies } from "@/hooks/queries";
import { Money } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const fallbackCurrencies = [
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "JPY", label: "JPY — Japanese Yen" },
] as const;

const coverPresets = [
  "/images/rome.jpg",
  "/images/florence.jpg",
  "/images/venice.jpg",
  "/images/vatican.jpg",
  "/images/trastevere.jpg",
  "/images/cooking.jpg",
  "/images/kyoto.jpg",
  "/images/lisbon.jpg",
  "/images/barcelona.jpg",
  "/images/santorini.jpg",
];

export default function CreateTripPage() {
  const router = useRouter();
  const createTrip = useCreateTrip();

  const form = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      currency: "INR",
      totalBudget: 0,
      coverImage: coverPresets[0],
      firstDestination: "",
    },
  });

  const onSubmit = (values: CreateTripFormValues) => {
    createTrip.mutate(
      {
        ...values,
        description: values.description || undefined,
        firstDestination: values.firstDestination?.trim() || undefined,
      },
      { onSuccess: (trip) => router.push(`/trips/${trip.id}/builder`) }
    );
  };

  const name = form.watch("name");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const totalBudget = form.watch("totalBudget");
  const currency = form.watch("currency");
  const { data: currenciesData } = useCurrencies();
  const currencies = currenciesData && currenciesData.length > 0
    ? currenciesData.map((c) => ({ value: c.isoCode, label: `${c.isoCode} — ${c.name}` }))
    : [...fallbackCurrencies];
  const coverImage = form.watch("coverImage");
  const firstDestination = form.watch("firstDestination");

  const days =
    startDate && endDate
      ? differenceInCalendarDays(parseISO(endDate), parseISO(startDate))
      : null;
  const durationValid = days !== null && isValid(parseISO(startDate)) && isValid(parseISO(endDate)) && days >= 0;

  return (
    <div className="container-page py-10 pb-24 sm:py-12">
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to trips
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: form */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create a trip</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A few details now — you can refine everything later in the builder.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip name</FormLabel>
                    <FormControl>
                      <Input placeholder="Italy Escape" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <span className="text-xs font-normal text-muted-foreground"> (optional)</span>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="A brief overview of your trip…"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="totalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total budget</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          placeholder="2400"
                          value={field.value === 0 && field.value !== undefined ? "" : String(field.value ?? "")}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover image</FormLabel>
                    <FormControl>
                      <div role="radiogroup" aria-label="Choose a cover image" className="flex flex-wrap gap-2">
                        {coverPresets.map((src) => (
                          <button
                            key={src}
                            type="button"
                            role="radio"
                            aria-checked={field.value === src}
                            onClick={() => field.onChange(src)}
                            className={cn(
                              "relative size-16 overflow-hidden rounded-lg border transition",
                              field.value === src
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-card border-transparent"
                                : "border-border opacity-80 hover:opacity-100"
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                            {field.value === src && (
                              <span className="absolute inset-0 flex items-center justify-center bg-primary/30">
                                <Check className="size-4 text-white" aria-hidden />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DestinationField form={form} />

              {createTrip.isError && (
                <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {createTrip.error?.message ?? "Something went wrong"}
                </div>
              )}

              <Button type="submit" disabled={createTrip.isPending} className="w-full sm:w-auto sm:min-w-40">
                {createTrip.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Creating…
                  </>
                ) : (
                  "Create Trip"
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Right: live preview */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage || coverPresets[0]}
              alt="Trip cover preview"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="space-y-4 p-5">
              <h2 className="text-lg font-bold text-foreground">
                {name.trim() || <span className="font-medium italic text-muted-foreground">Your trip name</span>}
              </h2>
              <p className="text-sm text-muted-foreground">
                {durationValid
                  ? `${days! + 1} ${days! + 1 === 1 ? "day" : "days"} · ${days} ${days === 1 ? "night" : "nights"}`
                  : "Pick your dates to see the duration"}
              </p>
              {(firstDestination?.trim() || "") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  <MapPin className="size-3.5" aria-hidden />
                  {firstDestination}
                </span>
              )}
              <div className="flex items-baseline justify-between border-t border-border pt-4">
                <Money amount={totalBudget} currency={currency} className="text-xl font-bold text-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{currency}</span>
              </div>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                You can add more cities after creation.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DestinationField({
  form,
}: {
  form: ReturnType<typeof useForm<CreateTripFormValues>>;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(id);
  }, [query]);

  const locations = useLocations({ query: debounced });
  const results = (debounced.trim().length >= 2 ? locations.data : []) ?? [];

  return (
    <FormField
      control={form.control}
      name="firstDestination"
      render={({ field }) => (
        <FormItem className="relative">
          <FormLabel>
            First destination<span className="text-xs font-normal text-muted-foreground"> (optional)</span>
          </FormLabel>
          <FormControl>
            <Input
              placeholder="Rome, Italy"
              autoComplete="off"
              value={field.value ?? ""}
              onChange={(e) => {
                field.onChange(e.target.value);
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                if (blurTimer.current) clearTimeout(blurTimer.current);
                blurTimer.current = setTimeout(() => setOpen(false), 150);
              }}
            />
          </FormControl>
          {open && results.length > 0 && (
            <ul
              role="listbox"
              aria-label="Suggested destinations"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-lift"
            >
              {results.slice(0, 6).map((loc) => (
                <li key={loc.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      field.onChange(loc.name);
                      setQuery(loc.name);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <span>{loc.name}</span>
                    <span className="text-xs text-muted-foreground">{loc.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
