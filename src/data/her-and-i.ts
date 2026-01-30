export type HerAndIPersonSlug = "hoang" | "mai";

export type HerAndISocial = {
  facebook?: string;
  instagram?: string;
  email?: string;
  linkedin?: string;
};

export type HerAndIStaticPerson = {
  name: string;
  slug: HerAndIPersonSlug;
  social: HerAndISocial;
  /** Fallback photo URLs when API has none (e.g. before first upload) */
  fallbackPhotos: string[];
};

export const herAndIStaticConfig: HerAndIStaticPerson[] = [
  {
    name: "Hoang",
    slug: "hoang",
    fallbackPhotos: ["/hoang/hoang_1.jpg", "/hoang/hoang_2.jpg", "/hoang/hoang_3.jpg"],
    social: {
      facebook: "",
      instagram: "",
      email: "",
      linkedin: "",
    },
  },
  {
    name: "Mai",
    slug: "mai",
    fallbackPhotos: ["/mai/mai_1.jpg", "/mai/mai_2.jpg", "/mai/mai_3.jpg"],
    social: {
      facebook: "",
      instagram: "",
      email: "",
      linkedin: "",
    },
  },
];
