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
};

export const herAndIStaticConfig: HerAndIStaticPerson[] = [
  {
    name: "Hoang",
    slug: "hoang",
    social: {
      facebook: "https://www.facebook.com/le.o.hoang.689066",
      instagram: "https://www.instagram.com/_hoangledo_/",
      email: "hoangledo2092004@gmail.com",
      linkedin: "https://www.linkedin.com/in/hle04/",
    },
  },
  {
    name: "Mai",
    slug: "mai",
    social: {
      facebook: "https://www.facebook.com/nguyen.hong.mai.673045",
      instagram: "https://www.instagram.com/meijinnnn.10/",
      email: "nguyenhongmai.forwork@gmail.com",
      linkedin: "https://www.linkedin.com/in/mhnguyen10/",
    },
  },
];
