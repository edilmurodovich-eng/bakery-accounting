
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bakery Accounting",
    short_name: "Bakery",
    description: "Расчёт себестоимости, продаж и прибыли кондитерской",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff8ef",
    theme_color: "#fff8ef",
    lang: "ru",
  };
}
