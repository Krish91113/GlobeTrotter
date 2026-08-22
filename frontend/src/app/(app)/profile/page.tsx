"use client";

import { useEffect, useState, useRef } from "react";
import { User, Settings, Save, LogOut, Camera, Trash2, Heart, AlertTriangle, ImageOff, Shield } from "lucide-react";
import { useCurrentUser, useLogout } from "@/features/auth/hooks/use-auth";
import {
  useProfile,
  useUpdateProfile,
  useUploadProfileImage,
  useRemoveProfileImage,
  useDeleteAccount,
  useSavedLocations,
  useUnsaveLocation,
  useCurrencies,
} from "@/hooks/queries";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

const travelPaces = [
  { value: "slow", label: "Relaxed & Slow", desc: "1-2 activities per day with plenty of free time." },
  { value: "moderate", label: "Balanced", desc: "2-4 activities per day with time to explore." },
  { value: "fast", label: "Fast-Paced", desc: "Packed schedule to see as much as possible." },
];

const budgetStyles = [
  { value: "budget", label: "Budget-Conscious", desc: "Hostels, public transit, and free sights." },
  { value: "moderate", label: "Comfortable", desc: "Mid-range hotels, casual dining, and guided tours." },
  { value: "luxury", label: "Luxury", desc: "Premium stays, fine dining, and private experiences." },
];

export default function ProfilePage() {
  const { data: authUser } = useCurrentUser();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();
  const removeImage = useRemoveProfileImage();
  const deleteAccount = useDeleteAccount();
  const logout = useLogout();
  const { data: savedLocations } = useSavedLocations();
  const unsaveLocation = useUnsaveLocation();
  const { data: currencies } = useCurrencies();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preferences, setPreferences] = useState({
    culture: 80,
    food: 90,
    adventure: 60,
    nature: 50,
    relaxation: 40,
    travelPace: "moderate" as "slow" | "moderate" | "fast",
    budgetLevel: "moderate" as "budget" | "moderate" | "luxury",
  });

  const [displayName, setDisplayName] = useState(authUser?.displayName || "Traveler");
  const [currency, setCurrency] = useState("INR");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.name);
    setCurrency(profile.currency);
    setPreferences(profile.preferences);
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({ name: displayName, currency, preferences });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP formats are supported");
      return;
    }
    uploadImage.mutate(file);
    e.target.value = "";
  };

  const handleDeleteAccount = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        logout.mutate();
      },
    });
  };

  const userInitials = (displayName || "T").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const avatarUrl = profile?.avatarUrl || authUser?.avatarUrl || authUser?.profileImageUri || "";
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  return (
    <div className="container-page py-12 pb-28 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">Profile & Settings</h1>
          <p className="mt-2 text-[#64748B]">Manage your account details and travel preferences.</p>
        </div>
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="inline-flex items-center gap-2 rounded-full border border-[#DC2626]/30 bg-[#FEF2F2] px-5 py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>

      <div className="mt-10 space-y-12">
        {/* Profile Photo & Account Info */}
        <section className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <User className="size-5 text-primary" />
            Account Information
          </h2>

          <div className="mt-6 flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative group">
                <div className="size-24 rounded-full overflow-hidden bg-[#F1F5F9] flex items-center justify-center border border-[#E2E8F0]">
                  {avatarUrl && !imageError ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="size-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{userInitials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImage.isPending}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="size-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImage.isPending}
                  className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {uploadImage.isPending ? "Uploading..." : "Change Photo"}
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => removeImage.mutate()}
                    disabled={removeImage.isPending}
                    className="text-xs font-semibold text-[#DC2626] hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>


            {/* Form fields */}
            <div className="flex-1 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none focus:border-primary focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email address</label>
                <input
                  type="email"
                  disabled
                  value={authUser?.email || "user@example.com"}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] px-4 text-sm text-[#64748B] cursor-not-allowed"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Preferred currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm outline-none focus:border-primary focus:bg-white"
                >
                  {currencies && currencies.length > 0 ? (
                    currencies.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.isoCode} {c.symbol ? `(${c.symbol})` : ""} — {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="INR">INR (₹) Indian Rupee</option>
                      <option value="USD">USD ($) US Dollar</option>
                      <option value="EUR">EUR (€) Euro</option>
                      <option value="GBP">GBP (£) British Pound</option>
                      <option value="JPY">JPY (¥) Japanese Yen</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Travel Interests */}
        <section className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            Travel Preferences & Interests
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            These weights calibrate our smart activity recommendations for your trips.
          </p>

          <div className="mt-8 space-y-6">
            {[
              { key: "culture", label: "Art, History & Culture", desc: "Museums, landmarks, historic walks" },
              { key: "food", label: "Gastronomy & Culinary", desc: "Local dining, street food, cooking classes" },
              { key: "adventure", label: "Outdoor & Adventure", desc: "Hikes, boat trips, extreme sports" },
              { key: "nature", label: "Parks & Scenic Nature", desc: "Gardens, viewpoints, beaches" },
              { key: "relaxation", label: "Relaxation & Leisure", desc: "Cafes, spas, slow strolls" },
            ].map((interest) => {
              const val = preferences[interest.key as keyof typeof preferences] as number;
              return (
                <div key={interest.key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-[#0F172A]">{interest.label}</span>
                      <span className="ml-2 text-xs text-[#64748B]">({interest.desc})</span>
                    </div>
                    <span className="font-bold text-primary">{val}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={val}
                    onChange={(e) => setPreferences({ ...preferences, [interest.key]: Number(e.target.value) })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#E2E8F0] accent-primary"
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Travel Style & Pace */}
        <section className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Travel Pace & Budget Level</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-3">Preferred travel pace</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {travelPaces.map((pace) => (
                  <button
                    key={pace.value}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, travelPace: pace.value as any })}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      preferences.travelPace === pace.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-[#E2E8F0] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <p className="font-bold text-sm text-[#0F172A]">{pace.label}</p>
                    <p className="mt-1 text-xs text-[#64748B]">{pace.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-3">Budget profile</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {budgetStyles.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, budgetLevel: style.value as any })}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      preferences.budgetLevel === style.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-[#E2E8F0] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <p className="font-bold text-sm text-[#0F172A]">{style.label}</p>
                    <p className="mt-1 text-xs text-[#64748B]">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Saved Destinations */}
        <section className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
            <Heart className="size-5 text-primary" />
            Saved Destinations
          </h2>
          {savedLocations && savedLocations.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {savedLocations.map((sl) => (
                <div key={sl.id} className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{sl.location.name}</p>
                    <p className="text-xs text-[#64748B]">{sl.location.country.displayName || sl.location.country.iso2Code}</p>
                  </div>
                  <button
                    onClick={() => unsaveLocation.mutate(sl.locationId)}
                    disabled={unsaveLocation.isPending}
                    className="rounded-full p-1.5 text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                  >
                    <Heart className="size-4 fill-[#DC2626] text-[#DC2626]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#64748B]">No saved destinations yet. Browse cities to save your favorites.</p>
          )}
        </section>

        {/* Save button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors disabled:opacity-60"
          >
            <Save className="size-4" />
            {updateProfile.isPending ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        {/* Danger Zone */}
        <section className="rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2]/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#DC2626] flex items-center gap-2">
            <Shield className="size-5" />
            Danger Zone
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteAccount.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#DC2626]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-60"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description="This will permanently delete your account, all trips, preferences, and data. This cannot be undone. Type DELETE to confirm."
        confirmLabel="Delete Account"
        onConfirm={handleDeleteAccount}
        destructive
        pending={deleteAccount.isPending}
      />
    </div>
  );
}
