export type LangaugeCodeType = "ar" | "en-US";

export const Languages: {
  label: string;
  code: LangaugeCodeType;
  flagIconName: string;
}[] = [
  {
    label: "Arabic",
    code: "ar",
    flagIconName: "ar.svg",
  },
  {
    label: "English",
    code: "en-US",
    flagIconName: "en-us.svg",
  },
];
