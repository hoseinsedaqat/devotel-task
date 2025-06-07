import { configureStore } from "@reduxjs/toolkit";

// features
import languageSlice from "../features/languageSlice";

export const store = configureStore({
  reducer: {
    language: languageSlice,
  },
});