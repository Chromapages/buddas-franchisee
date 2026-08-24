"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { CheckCircle2, AlertCircle, Clock, MapPin } from "lucide-react";
import {
  APPROVED_TERRITORIES,
  PENDING_REGISTRATION_STATES,
  evaluateTerritory,
} from "@/src/features/territory/territory-rules";
import type { TerritoryEvaluation } from "@/src/features/territory/types";

export const TerritoryChecker = () => {
  const [selectedState, setSelectedState] = useState<string>("HI");
  const [evaluation, setEvaluation] = useState<TerritoryEvaluation>(
    evaluateTerritory("HI"),
  );

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const code = event.target.value;
    setSelectedState(code);
    setEvaluation(evaluateTerritory(code));
  };

  return (
    <div className="bg-white border border-brand-charcoal/10 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-sand flex items-center justify-center text-brand-clay">
          <MapPin className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading text-brand-charcoal">
            Check Market &amp; Territory Clearance
          </h3>
          <p className="text-sm text-brand-charcoal/70">
            Select your target state to review regulatory clearance and active offering status.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <label
          htmlFor="territory-select"
          className="block text-xs font-bold uppercase tracking-wider text-brand-charcoal/80"
        >
          Select State or Territory
        </label>
        <select
          id="territory-select"
          value={selectedState}
          onChange={handleStateChange}
          tabIndex={0}
          aria-label="Select target state for franchise offering clearance"
          className="w-full px-4 py-3.5 bg-brand-sand/50 border border-brand-charcoal/20 rounded-xl text-base font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-clay focus:border-brand-clay"
        >
          <optgroup label="Active Cleared Offering States">
            {Object.entries(APPROVED_TERRITORIES).map(([code, name]) => (
              <option key={code} value={code}>
                {name} ({code}) — Active Offering Cleared
              </option>
            ))}
          </optgroup>
          <optgroup label="Pending Franchise Registration Filings">
            {Object.entries(PENDING_REGISTRATION_STATES).map(([code, name]) => (
              <option key={code} value={code}>
                {name} ({code}) — Priority Registration Pending
              </option>
            ))}
          </optgroup>
          <optgroup label="Other Expansion Markets">
            <option value="OR">Oregon (OR) — Future Development Phase</option>
            <option value="ID">Idaho (ID) — Future Development Phase</option>
            <option value="TN">Tennessee (TN) — Future Development Phase</option>
          </optgroup>
        </select>

        {/* Evaluation Banner */}
        <div
          className={`p-5 rounded-2xl flex items-start gap-4 border transition-all ${
            evaluation.status === "APPROVED"
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : evaluation.status === "PENDING_REGISTRATION"
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-brand-sand border-brand-charcoal/10 text-brand-charcoal"
          }`}
        >
          {evaluation.status === "APPROVED" ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : evaluation.status === "PENDING_REGISTRATION" ? (
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-6 h-6 text-brand-clay flex-shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold font-heading text-base">
                {evaluation.stateName}
              </span>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  evaluation.status === "APPROVED"
                    ? "bg-emerald-200/60 text-emerald-800"
                    : evaluation.status === "PENDING_REGISTRATION"
                      ? "bg-amber-200/60 text-amber-800"
                      : "bg-brand-charcoal/10 text-brand-charcoal/70"
                }`}
              >
                {evaluation.status === "APPROVED"
                  ? "Cleared for Offering"
                  : evaluation.status === "PENDING_REGISTRATION"
                    ? "Filing Pending"
                    : "Future Interest"}
              </span>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              {evaluation.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
