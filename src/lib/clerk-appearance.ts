/** Island Block styling for Clerk's prebuilt components */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#007A3D",
    colorText: "#141414",
    colorBackground: "#FFFFFF",
    borderRadius: "0px",
    fontFamily: "var(--font-source), 'Source Sans 3', sans-serif",
  },
  elements: {
    card: "border-2 border-[#121212] shadow-[6px_6px_0_#121212] rounded-none",
    formButtonPrimary:
      "bg-[#007A3D] hover:bg-[#005C2E] text-white font-bold uppercase tracking-wider border-2 border-[#121212] rounded-none shadow-[3px_3px_0_#121212]",
    formFieldInput: "border-2 border-[#121212] rounded-none bg-[#FAF6EE]",
    footerActionLink: "text-[#007A3D] font-bold hover:text-[#005C2E]",
  },
};
