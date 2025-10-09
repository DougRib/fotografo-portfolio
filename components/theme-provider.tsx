/**
 * Theme Provider usando next-themes
 * 
 * Fornece suporte a dark mode/light mode em toda aplicação.
 * Persiste a preferência do usuário no localStorage.
 */

'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes'


export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}