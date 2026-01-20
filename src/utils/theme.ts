import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";
import { ThemeColors } from "@/types";

const fullConfig = resolveConfig(tailwindConfig);

type DefaultTheme = typeof fullConfig.theme;

export type AppTheme = DefaultTheme & {
  colors: DefaultTheme["colors"] & ThemeColors;
};

const theme = fullConfig.theme as AppTheme;

export default theme;
