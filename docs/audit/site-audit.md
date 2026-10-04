# seudevelopment.ge — არსებული საიტის აუდიტი

თარიღი: 2026-10-04 · წყარო: https://www.seudevelopment.ge (ka) და `/en`

## ტექნოლოგია
- Next.js (App Router, Turbopack build), React, Tailwind, Radix UI, next-intl (`ka` ნაგულისხმევი, `/en` პრეფიქსი, cookie `NEXT_LOCALE`).
- მონაცემები მოდის REST API-დან (`NEXT_PUBLIC_API_URL`, proxied `/api/*`):
  `POST /projects/search`, `/buildings`, `/units`, `/news/search`, `/partners/search`, `/landing-partners/search`.
- ადმინ-პანელი იმავე აპშია (CSS-ში `adminFadeIn`, `adminSlide*` keyframes; CRUD მეთოდები client bundle-ში).
- **აუდიტის დროს ყველა `/api/*` აბრუნებს 502-ს** → პროექტები, ბინები, სიახლეები, პარტნიორები ცარიელია.

## გვერდები
| Route | შინაარსი |
|---|---|
| `/` | ჰერო (პროექტების სლაიდერი — ცარიელი), ვიდეო-ბლოკი + "2014 წლიდან", ჩვენ შესახებ, პარტნიორები, ზარის ფორმა + კონტაქტი + რუკა, ფუტერი |
| `/about` | ოფისის ფოტო, მისია, "შემოუერთდი გუნდს" + CV ატვირთვა, პარტნიორები (80+), ფორმა |
| `/visual-search` → `/visual-search/[id]` | პროექტი → კორპუსი (რენდერზე hotspot) → სართული → ბინა; "როგორ მუშაობს" 4 ნაბიჯი |
| `/search` → `/search/[id]` | ფილტრი (პროექტი, ბლოკი, ფართი, ოთახები, ფასი), ბინის ბარათი, გეგმა, PDF პრეზენტაცია/ბეჭდვა, მსგავსი ბინები |
| `/card` | სეუ ბარათი + პარტნიორების სია |
| `/news` → `/news/[id]` | სიახლეები + YouTube ვიდეოები |
| `/contact`, `/policy` | ფორმა/კონტაქტი, კონფიდენციალურობის პოლიტიკა |

დომენის მოდელი: Project (status: planning/presale/under_construction/completed/sold_out) → Building/Block → Floor → Unit (available/reserved/sold/not_for_sale; rooms, sizes, price, plan, PDF).

## ბრენდი / ტოკენები (არსებული)
- ფერები: `--primary-green #2ecc71`, `--primary-orange #ff6b35`, `--dark-green #0d141d` (ფონი), `--site-fg #f4f0e9` (კრემისფერი ტექსტი/ღია სექციები), muted `#a19c92`, ფუტერი `#040303`.
- ფონტები: Noto Sans Georgian, Montserrat, Geist; ზოგან Bodoni fallback.
- ლოგო: იზომეტრიული "S" wireframe (SVG), ფერადი ვერსია — მწვანე/ლაიმი/ლურჯი.
- ანიმაციები: მხოლოდ `fadeInUp`, `spin`, hero-ში `seuBreathe/seuHalo/seuSweep/seuPolygonsIn`; scroll-ანიმაციები და smooth scroll პრაქტიკულად არ არის.

## ძირითადი პრობლემები
**ფუნქციური**
1. API 502 → მთავარი გვერდის პირველი ეკრანი ცარიელია ("პროექტები ჯერ არ არის"), ძებნა უსასრულო spinner-ზეა.
2. ცარიელი/შეცდომის მდგომარეობები არ არის დამუშავებული — დიზაინი ინგრევა მონაცემების გარეშე.
3. ჰეროს ვიდეო-ბლოკი ცარიელი ნაცრისფერი ყუთია.
4. `/contact`-ზე ფორმა+კონტაქტი ორჯერ მეორდება.
5. ორანჟისფერი "სატესტო რეჟიმი" ბანერი production-ზე.

**ვიზუალური / UX**
6. Georgian ტექსტზე ზედმეტი letter-spacing (ნავიგაცია, ფუტერი, "კონტაქტი" ღილაკი) — იკითხება ცუდად.
7. "კონტაქტი" ღილაკი ჰედერში დაბალი კონტრასტის ნაცრისფერია, არ ჰგავს CTA-ს.
8. მთავარ ჰეროში ტექსტი ორივე მხარეს ვიწრო სვეტებად არის "მიჭყლეტილი"; ჰედერი 157px სიმაღლისაა და ეკრანის დიდ ნაწილს იკავებს.
9. დიდი ცარიელი სივრცეები (about-ზე ცარიელი ბარათი, card-ზე ცარიელი პარტნიორები), ტიპოგრაფიული იერარქია სუსტია.
10. ფუტერი: SEU Development სათაური ნაცრისფერი, დიდი ცარიელი შავი ზოლი; სოციალური ხატულები პატარა.
11. Mobile: ჰორიზონტალური overflow (`/` და `/card`), card-ის ბლერიანი ჩრდილი გადის ეკრანიდან.

**SEO / ხარისხი**
12. მთავარ, about, news, contact, search გვერდებზე `<h1>` არ არის.
13. `og:url` და og-image მიუთითებს `seudevelopment.grena.ge`-ზე; `og:locale` en_US ქართულ გვერდზე.
14. ტექსტური შეუსაბამობები: "2016 წლიდან" (meta) vs "2014 წლიდან" (კონტენტი); "ჩვენს შესახებ" vs "ჩვენ შესახებ"; EN-ში "SEU CARD"/"NEWS"/"About" სხვადასხვა რეგისტრით.
15. ადმინ-პანელის CSS/JS საჯარო bundle-ში (189KB CSS).

## შენახული მასალა
- `content/messages-ka.json`, `content/messages-en.json` — საიტის ყველა UI/მარკეტინგული ტექსტი ორ ენაზე.
- `content/policy-ka.txt`, `content/news-videos-ka.txt`.
- `screenshots/` — ყველა გვერდის full-page სქრინშოტი (desktop 1440 / mobile 390).
