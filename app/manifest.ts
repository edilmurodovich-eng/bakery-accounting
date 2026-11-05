import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Modigul Accounting",
    short_name: "Modigul",
    description: "Расчёт себестоимости, продаж и прибыли кондитерской",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5eef1",
    theme_color: "#450914",
    lang: "ru",
    icons: [
      {
        src: "/modigul-logo.png",
        sizes: "640x640",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
