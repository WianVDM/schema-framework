import type { ReactNode } from "react";
import { createContext } from "react";
import type { ThemeConfig } from "../types";

const defaultTheme: ThemeConfig = {};

export const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export function ThemeProvider({
	theme,
	children,
}: {
	theme: ThemeConfig;
	children: ReactNode;
}) {
	return (
		<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
	);
}
