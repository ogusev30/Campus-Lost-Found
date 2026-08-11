import type { Metadata } from "next";
import { Bitter, Work_Sans, Permanent_Marker } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getDictionary } from "@/lib/i18n/locale";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, dict } = await getDictionary();

  return (
    <html
      lang={locale}
      className={`${bitter.variable} ${workSans.variable} ${permanentMarker.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="flex h-screen overflow-hidden">
        <Sidebar dict={dict.nav} />
        <div className="flex h-screen flex-1 flex-col overflow-hidden">
          <Header dict={dict} locale={locale} />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
