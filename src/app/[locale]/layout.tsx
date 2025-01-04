import type { Metadata } from "next";
import localFont from "next/font/local";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import path from 'path';
import fs from 'fs';
import { SessionProvider } from "next-auth/react";
import LanguageSwitcher from "./components/language-stuff/LanguageSwitcher";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages } from "next-intl/server";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

type Params = Promise<{ locale: string }>

export const metadata: Metadata = {
  title: "Bumby WhatsApp Lead Management",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const toastContainerPosition = locale === 'he' ? 'top-left' : 'top-right';
  
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        <NextIntlClientProvider messages={messages}>
          <ToastContainer 
            position={toastContainerPosition} 
            autoClose={3000} 
            hideProgressBar={false} 
            newestOnTop={false} 
            closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
        />
        {children}
        <div className="flex justify-center mt-4">
          <LanguageSwitcher />
        </div>
        </NextIntlClientProvider>
      </body>
      
    </html>
  );
}
