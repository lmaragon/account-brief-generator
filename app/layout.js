import "./globals.css";

export const metadata = {
  title: "Account Brief Generator",
  description: "AI-powered account briefs for enterprise sustainability sales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
