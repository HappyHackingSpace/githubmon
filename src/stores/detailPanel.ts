import { create } from "zustand";
import type { DetailPanelIssue } from "@/components/ui/detail-panel";

interface DetailPanelState {
  selectedIssue: DetailPanelIssue | null;
  isOpen: boolean;

  openPanel: (issue: DetailPanelIssue) => void;
  closePanel: () => void;
  setIssue: (issue: DetailPanelIssue | null) => void;
}

export const useDetailPanelStore = create<DetailPanelState>((set) => ({
  selectedIssue: null,
  isOpen: false,

  openPanel: (issue) => set({ selectedIssue: issue, isOpen: true }),

  closePanel: () => set({ isOpen: false }),

  setIssue: (issue) => set({ selectedIssue: issue }),
}));
