import { createContext } from "react";
import { OtpContextProps } from "~/types/otp";

export const OtpContext = createContext<OtpContextProps>({} as OtpContextProps);
