/*
 * News items. Titles and YouTube ids are the ones published on seudevelopment.ge/news; the
 * featured forum story comes from the site's own copy. Dates and reading times are
 * placeholders until the CMS feed is connected.
 */
export type NewsItem = {
  slug: string;
  title: string;
  tag: string;
  date: string;
  minutes: number;
  image: string;
  videoId?: string;
  excerpt: string;
};

const yt = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const featured: NewsItem = {
  slug: "international-business-forum",
  title: "International Business Forum",
  tag: "SEU Development",
  date: "01.01.2026",
  minutes: 5,
  image: "/images/news-forum.jpg",
  excerpt:
    "SEU Development participated in the International Business Forum, showcasing our latest projects and vision for the future of real estate in Georgia.",
};

export const news: NewsItem[] = [
  featured,
  {
    slug: "seu-varketili",
    title: "SEU Varketili — a European residential complex",
    tag: "SEU Varketili",
    date: "12.11.2025",
    minutes: 3,
    image: "/images/news-varketili.jpg",
    videoId: "6dCWXfB7nvc",
    excerpt: "A new district of Varketili built to European standards on 3.5 hectares, with its own school, sports grounds and two hectares of recreation.",
  },
  {
    slug: "city-in-your-neighbourhood",
    title: "A city in your neighbourhood",
    tag: "SEU Varketili",
    date: "28.09.2025",
    minutes: 4,
    image: "/images/news-city.jpg",
    excerpt: "Shops, offices, a school and parks within the complex — everything for everyday life a few steps from home.",
  },
  {
    slug: "green-yard-mural",
    title: "Musia Keburia painted the courtyard of Green Yard",
    tag: "Green Yard",
    date: "14.06.2024",
    minutes: 2,
    image: yt("r_miScU4lF8"),
    videoId: "r_miScU4lF8",
    excerpt: "The artist turned the courtyard of the Green Yard residential complex into an open-air gallery for residents.",
  },
  {
    slug: "new-project-saburtalo",
    title: "SEU Development's new residential project in Saburtalo",
    tag: "Saburtalo",
    date: "03.03.2023",
    minutes: 3,
    image: yt("zR_OOfwmCls"),
    videoId: "zR_OOfwmCls",
    excerpt: "A new residential project joins SEU Development's completed complexes in Saburtalo.",
  },
  {
    slug: "real-estate-project-awards-2018",
    title: "Real Estate Project Awards 2018",
    tag: "Awards",
    date: "20.11.2018",
    minutes: 2,
    image: yt("8fxVDNgDRxc"),
    videoId: "8fxVDNgDRxc",
    excerpt: "SEU Development won Residential Project of the Year and Sales Performance Excellence at the East Europe Real Estate Project Awards.",
  },
  {
    slug: "first-residential-complex",
    title: "SEU Development's first residential complex",
    tag: "History",
    date: "10.05.2017",
    minutes: 3,
    image: yt("PSph7mIYx7s"),
    videoId: "PSph7mIYx7s",
    excerpt: "How SEU Development delivered its first residential complex — fully funded from the start and finished on schedule.",
  },
  {
    slug: "zurab-mekvabishvili-interview",
    title: "Interview with Zurab Mekvabishvili",
    tag: "Interview",
    date: "18.02.2017",
    minutes: 6,
    image: yt("igLFt-ICY2k"),
    videoId: "igLFt-ICY2k",
    excerpt: "A conversation about the company's approach to construction standards, funding and social responsibility.",
  },
  {
    slug: "new-project",
    title: "SEU Development's new project",
    tag: "Projects",
    date: "02.12.2016",
    minutes: 2,
    image: yt("klxgREcaczw"),
    videoId: "klxgREcaczw",
    excerpt: "SEU Development presents its next residential project.",
  },
];

export const newsBySlug = (slug: string) => news.find((n) => n.slug === slug);

export const isExternal = (src: string) => src.startsWith("http");
