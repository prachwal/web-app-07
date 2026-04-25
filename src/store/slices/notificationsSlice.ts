import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Severity level of a notification. */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** A single notification item displayed as a toast. */
export interface Notification {
  /** Unique identifier generated at creation time. */
  id: string;
  /** Visual severity / color of the toast. */
  type: NotificationType;
  /** Human-readable message shown in the toast. */
  message: string;
  /**
   * Auto-dismiss delay in milliseconds.
   * `0` means the notification persists until manually closed.
   * Defaults to 4000 ms when omitted.
   */
  duration?: number;
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Adds a new notification. A unique `id` is generated automatically.
     *
     * @param state - Current notifications state
     * @param action - Payload with all fields except `id`
     */
    addNotification(state, action: PayloadAction<Omit<Notification, 'id'>>) {
      state.items.push({ id: crypto.randomUUID(), ...action.payload });
    },

    /**
     * Removes a notification by its `id`.
     *
     * @param state - Current notifications state
     * @param action - Payload containing the `id` to remove
     */
    removeNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },

    /**
     * Removes all notifications at once.
     *
     * @param state - Current notifications state
     */
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
