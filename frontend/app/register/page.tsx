import type { Metadata } from "next";
import AuthScreen from "@/components/AuthScreen";

export const metadata: Metadata = { title: "ساخت حساب" };

export default function RegisterPage() {
  return <AuthScreen mode="register" />;
}
