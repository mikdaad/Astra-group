"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function SecuritySettingsPage() {
  const [oldPin, setOldPin] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");

  const isFourDigits = (v: string) => /^\d{4}$/.test(v);
  const canSubmit = isFourDigits(oldPin) && isFourDigits(newPin) && newPin === confirmPin;

  return (
    <main className="text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Change Transaction Pin</h1>
      </div>

      <section>
        <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="rounded-[22px] border border-white/10 p-5 sm:p-6 bg-[radial-gradient(156.78%_167.36%_at_120.85%_-31.14%,_#EE6200_0%,_#8A3901_51.75%,_#371701_100%)]">
            <div className="space-y-4 sm:space-y-5 max-w-3xl">
              <Input
                type="password"
                inputMode="numeric"
                pattern="\\d*"
                maxLength={4}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-12 sm:h-14 rounded-xl bg-black/60 border-white/20 text-white placeholder:text-white/70"
                placeholder="Existing Transaction Pin"
              />

              <Input
                type="password"
                inputMode="numeric"
                pattern="\\d*"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-12 sm:h-14 rounded-xl bg-black/60 border-white/20 text-white placeholder:text-white/70"
                placeholder="Set Transaction Pin"
              />

              <Input
                type="password"
                inputMode="numeric"
                pattern="\\d*"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ""))}
                className="h-12 sm:h-14 rounded-xl bg-black/60 border-white/20 text-white placeholder:text-white/70"
                placeholder="Confirm Transaction Pin"
              />

              <div className="pt-2 flex justify-center">
                <Button
                  disabled={!canSubmit}
                  className="rounded-full bg-gradient-to-b from-orange-600 to-amber-800 hover:opacity-90 px-8 h-11 sm:h-12"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


