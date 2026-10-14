/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.NEXT_PUBLIC_DEMO === "1" ? "export" : undefined,
};

export default nextConfig;
