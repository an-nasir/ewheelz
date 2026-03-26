// Root layout required by Next.js App Router.
// next-intl middleware redirects "/" → "/en" (or "/ur"),
// so all real rendering happens in src/app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
