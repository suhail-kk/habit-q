import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryClientProviderWrapper from "@/config/QueryClientProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Thinkly - Daily AI Questions",
  description: "Generate and solve one AI-powered question per day",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProviderWrapper>
          {children}
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
