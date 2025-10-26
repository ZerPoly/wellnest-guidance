// theme/appTheme.ts
"use client";

import { createTheme, Theme, PaletteMode } from '@mui/material/styles';

// --- A. Define the Raw HSL Colors (The Source of Truth) ---
// These HSL values are pulled directly from your global CSS file.
// We use these in the createTheme call for stability.
const RAW_COLORS = {
    // PRIMARY COLORS PURPLE (hsl(263, 83%, X%))
    primary: {
        darker: 'hsl(263, 83%, 10%)',
        dark: 'hsl(263, 83%, 25%)',
        main: 'hsl(263, 83%, 34%)', // --primary
        light: 'hsl(263, 83%, 60%)', // --primary-light
        lighter: 'hsl(263, 83%, 85%)',
    },
    // SECONDARY CYAN (hsl(180, 100%, X%))
    secondary: {
        dark: 'hsl(180, 100%, 30%)',
        main: 'hsl(180, 100%, 40%)', // --cyan
        light: 'hsl(180, 100%, 70%)',
    },
    // BACKGROUNDS (using light mode variables for theme resolution)
    background: {
        paperLight: 'hsl(220, 100%, 100%)', // --bg-light
        textLight: 'hsl(220, 46%,96%)', // --text1 (used for contrast text on dark backgrounds)
    },
};

// --- B. Theme Creation Function ---
const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        // The color properties *MUST* use valid color strings (like HSL, not CSS variables)
        primary: {
            // We use RAW_COLORS here. The main color switches based on mode.
            main: mode === 'dark' ? RAW_COLORS.primary.light : RAW_COLORS.primary.main,
            light: RAW_COLORS.primary.light,
            dark: RAW_COLORS.primary.dark,
            contrastText: mode === 'dark' ? RAW_COLORS.background.textLight : RAW_COLORS.background.paperLight,
        },
        secondary: {
            // FIX: Use the HSL string for the color property
            main: RAW_COLORS.secondary.main, 
            dark: RAW_COLORS.secondary.dark,
            contrastText: RAW_COLORS.background.paperLight,
        },
        // For colors used in SX props (like background/text), using CSS variables is still fine 
        // because those properties are evaluated by the browser at runtime, not by createTheme.
        // We revert to CSS variables here for maximal adherence to your global CSS.
        background: {
            default: 'var(--bg)',
            paper: 'var(--bg-light)',
        },
        text: {
            primary: 'var(--text)',
            secondary: 'var(--text-muted)',
            disabled: 'var(--text-placeholder)',
        },
        divider: 'var(--border)',
        action: {
            hover: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        }
    },
    
    typography: {
        fontFamily: '"Metropolis", sans-serif',
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
    },

    components: {
        // These can still use CSS variables within styleOverrides as they run on the client
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: 'var(--bg-light)', 
                    color: 'var(--text)', 
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: '"Metropolis", sans-serif',
                }
            }
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        // Use CSS variables or inherited palette values here
                        backgroundColor: 'var(--primary)',
                        color: 'var(--bg-light)',
                    }
                }
            }
        }
    }
});

// C. Create and export the themes
export const lightTheme: Theme = createTheme(getDesignTokens('light'));
export const darkTheme: Theme = createTheme(getDesignTokens('dark'));