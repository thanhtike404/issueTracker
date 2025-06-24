// stores/socketIo/connectedUserStore.ts
import { create } from 'zustand';

type ConnectedUserStore = {
    connectedUserIds: string[];
    setConnectedUserIds: (ids: string[]) => void;
};

export const useConnectedUserStore = create<ConnectedUserStore>((set) => ({
    connectedUserIds: [],
    setConnectedUserIds: (ids) => set({ connectedUserIds: ids }),
}));

