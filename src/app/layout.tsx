import type { Metadata } from "next";
import { Bitter, Work_Sans, Permanent_Marker } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Campus Lost & Found",
  description:
    "Find it. Report it. Get it back. The campus board for lost and found items.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bitter.variable} ${workSans.variable} ${permanentMarker.variable} h-full`}
    >
      <body className="flex min-h-full">
        <Sidebar />
        <div className="flex min-h-full flex-1 flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
