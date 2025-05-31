import NavbarAuth from "@/components/NavbarAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarAuth />
      <main>
        {children}
      </main>
    </>
  );
}
