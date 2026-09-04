import { MetadataRoute } from "next";

const BASE_URL = "https://www.kteccomputereducation.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/courses",
    "/admissions",
    "/gallery",
    "/offers",
    "/contact",
    "/verify-certificate",
    "/login",
  ];

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
