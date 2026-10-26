const githubPages = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const nextConfig = {
  ...(githubPages
    ? { output: "export", basePath: "/loanlens-ai", trailingSlash: true }
    : {}),
};
export default nextConfig;
