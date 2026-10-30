import type { Metadata } from "next";
import BrandEditor from "@/components/admin/BrandEditor";

export const metadata: Metadata = {
  title: "Admin · Brands",
  robots: { index: false, follow: false },
};

export default function AdminBrandsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <BrandEditor />
    </div>
  );
}
