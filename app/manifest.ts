
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
theme_color: "#f5eef1",
    lang: "ru",
  };
}
