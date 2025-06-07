import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  set_language: "فارسی",
  set_text: "Submit"
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state) => {
      state.set_language = state.set_language === "فارسی" ? "English" : "فارسی";
      state.set_text = state.set_text === "Submit" ? "ارسال" : "Submit";
    },
  },
});

export const { setLanguage } = languageSlice.actions;

export default languageSlice.reducer;
