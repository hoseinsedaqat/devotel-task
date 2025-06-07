"use client";

import { useSelector,useDispatch } from "react-redux";
import { setLanguage } from "../features/languageSlice";

interface RootState {
  language: {
    set_language: string;
  };
}

const LanguageToggle = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.language.set_language);

  return (
    <button 
    
    onClick={() => dispatch(setLanguage())}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      {language}
    </button>
  );
};

export default LanguageToggle;