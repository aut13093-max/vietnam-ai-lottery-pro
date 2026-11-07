
import "./globals.css";

export const metadata = {
  title: "VIETNAM AI LOTTERY PRO",
  description: "Vietnam Lottery Statistics and Analysis Platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
