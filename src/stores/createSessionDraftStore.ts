import { create } from "zustand";

import type { CreateSessionDraft } from "@/src/types/domain/createSessionDraft";

/** `DEFAULT_PACE_SEC === 360`과 동일한 표시 */
const DEFAULT_AVG_PACE_DISPLAY = "06:00";

function buildInitialDraft(): CreateSessionDraft {
  return {
    title: "",
    locationName: "",
    targetDistanceKm: "",
    avgPace: DEFAULT_AVG_PACE_DISPLAY,
    startAt: "",
    capacity: "",
    genderPolicy: "",
    runType: "",
    locationX: "",
    locationY: "",
    routePolyline: [],
  };
}

type CreateSessionDraftStore = CreateSessionDraft & {
  setDraft: (partial: Partial<CreateSessionDraft>) => void;
  resetDraft: () => void;
};

export const useCreateSessionDraftStore = create<CreateSessionDraftStore>(
  (set) => ({
    ...buildInitialDraft(),
    setDraft: (partial) => set((state) => ({ ...state, ...partial })),
    resetDraft: () => set(buildInitialDraft()),
  }),
);
