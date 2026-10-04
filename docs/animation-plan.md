# SEU Development — ანიმაციების გეგმა (შესათანხმებელი)

წყაროები: დიზაინი `docs/design/screens/`, რეფერენსი era.estate (`docs/design/reference/era-estate-3d-map.mp4`),
PDF შაბლონი `docs/design/apartment-profile-template.pdf`, ფონტი BPG Rioni Contrast (`assets/fonts/`).

## რეფერენსიდან (era.estate) რას ვიღებთ
- Three.js 3D რუკა (GLTF/DRACO), ღრუბლებიდან „ჩაფრენა“, pin-ზე დაჭერით მარჯვენა პანელი.
- Preloader პროცენტული მთვლელით და თხელი ხაზების ორნამენტით.
- Barba.js გვერდებს შორის გადასვლები, Splitting.js ტექსტის reveal, clip-path reveal-ები, parallax, lerp smooth scroll, scroll-driven კადრების sequence.

## სტეკი
Next.js (static export → GitHub Pages) · GSAP + ScrollTrigger · Lenis · MapLibre GL (OpenFreeMap tiles, key არ სჭირდება) ან Three.js · Framer Motion (მოდალები/layout)

## გლობალური
| # | ელემენტი | ანიმაცია |
|---|---|---|
| G1 | Preloader | wireframe „S“ ლოგო ხაზებით იხატება + 0→100% მთვლელი (Rioni Contrast) → ღრუბლების გაფანტვით ჰეროზე გადასვლა. მხოლოდ პირველ ვიზიტზე |
| G2 | Smooth scroll | Lenis, ინერციული სქროლი |
| G3 | ჰედერი | ქვემოთ სქროლზე იმალება, ზემოთ ჩნდება; სქროლის შემდეგ blur ფონი; აქტიური ბმულის ხაზი გადაცურავს; EN/GE pill გადაცურავს |
| G4 | გვერდებს შორის | მუქი „ფარდა“ ქვემოდან ზემოთ + ლოგო; Contact-ზე — დიაგონალური კრემისფერი wipe (დიზაინის მიხედვით) |
| G5 | სათაურები | ხაზ-ხაზ ამოსვლა ნიღბიდან (mask reveal), ბოლო „.“ წერტილი მწვანედ ანთება |
| G6 | სურათები | clip-path reveal ქვემოდან + მსუბუქი scale 1.15→1 და parallax |
| G7 | ღილაკები | magnetic ეფექტი, hover-ზე ფონის შევსება მარცხნიდან |
| G8 | კურსორი (არჩევითი) | წრიული custom კურსორი, რუკაზე/კარუსელზე „DRAG“ |
| G9 | ფუტერი | „SEU development“ ასოები სათითაოდ ამოდის, wireframe ლოგო ნელა იხატება |
| G10 | Reduced motion | `prefers-reduced-motion`-ზე ყველა მძიმე ეფექტი ითიშება |

## მთავარი გვერდი
| # | სექცია | ანიმაცია |
|---|---|---|
| H1 | ჰერო 3D რუკა | თბილისის მოხრილი (globe) 3D რუკა, კამერის ნელი orbit, SEU pin პულსირებს; პროექტების სლაიდერი (dot-ები) — სლაიდის შეცვლაზე კამერა მიფრინავს შესაბამის პროექტზე, სათაური და სტატუსი იცვლება |
| H2 | ფილტრის პანელი | glass blur, მარჯვნიდან შემოსვლა, საძინებლების ღილაკები toggle-ზე „ახტება“ |
| H3 | Scroll indicator | ისრები მოძრაობს ქვემოთ |
| H4 | About company | wireframe ლოგო იხატება; წყვეტილი წრეები სქროლზე ბრუნავს/ფართოვდება; ვიდეო ბლოკი წრიდან იხსნება (circle → rect); ტექსტები გვერდებიდან შემოდის |
| H5 | Ongoing | სრულ ეკრანიანი პროექტის პანელები: pin + შემდეგი პანელი ზემოდან „ეფარება“ (stack), ფოტოს parallax |
| H6 | Upcoming | შახმატული ბარათები მარცხნიდან/მარჯვნიდან შემოდის, hover-ზე ფოტო ნელა იზრდება |
| H7 | Partners | უწყვეტი marquee, hover-ზე ჩერდება, ლოგო ფერად გადადის |
| H8 | About SEU | ფერადი იზომეტრიული „S“ ფენა-ფენა აიწყობა სქროლზე (3 ფენა სხვადასხვა მხრიდან) |
| H9 | Request call / Contact | ველები stagger-ით, focus-ზე ხაზის ანიმაცია, რუკის pin ვარდება |

## Visual search / პროექტი / ბინა
| # | ეკრანი | ანიმაცია |
|---|---|---|
| P1 | Choose project | პროექტის ფოტოები parallax, სტატუსის სათაურები mask reveal |
| P2 | Project profile — ბლოკის არჩევა | რენდერზე pin-ები ჩამოვარდება; hover კორპუსზე — სართულები მწვანედ ინთება (დიზაინის მიხედვით); „See sun directions“ — მზის რკალი/გრადიენტი რენდერზე |
| P3 | სტატისტიკა | რიცხვები count-up (16 სართული, 2 ლიფტი, 64–250 მ²) |
| P4 | Benefits სლაიდერი | 01/05 მთვლელი, სლაიდები clip-path-ით |
| P5 | Apartment types | სტრიქონები stagger, hover-ზე ისარი გადაცურავს და პრევიუ ჩნდება |
| P6 | სართულის გეგმა | ↑/↓ სართულის შეცვლა — გეგმა ვერტიკალურად გადაცურავს, ნომერი „ბარაბანივით“ ტრიალებს; ბინაზე hover — შევსება + სტატუსის pill; Blocks მინი-რუკაზე აქტიური ბლოკი |
| P7 | Floor plan ⇄ Grid view | ბინები FLIP ანიმაციით გადაეწყობა ბარათებად |
| P8 | ბინის გვერდი | 3D/2D/Plan ტაბები crossfade; ზომები count-up; კომპასი ბრუნავს |
| P9 | Request call მოდალი | backdrop blur + მოდალი scale-in, ბინის ბარათი გვერდიდან შემოდის |
| P10 | Similar apartments | drag კარუსელი ინერციით |
| P11 | ბინის ბარათი (ყველგან) | hover — აწევა, 3D რენდერი ოდნავ ბრუნავს, სტატუსის ფერი |

## სხვა გვერდები
| # | გვერდი | ანიმაცია |
|---|---|---|
| S1 | Apartments (search) | ფილტრის შეცვლაზე შედეგები stagger-ით; ცარიელი შედეგი — ლუპის აიკონი „ირხევა“ |
| S2 | SEU Card | ბარათი მაუსს მიჰყვება 3D tilt-ით + ნელი ტივტივი + ჩრდილი; partners ბარათები stagger |
| S3 | News | ჰეროს ფოტო Ken Burns; ბარათები masonry stagger; პოსტის ჰერო parallax |
| S4 | About | ჰეროს ჩიპები (Our team/mission/career/partners) ჩამოდის და anchor-ზე რბილად სქროლავს; გუნდის და ვაკანსიების კარუსელები |
| S5 | Privacy | მხოლოდ რბილი fade, სუფთა წასაკითხი |

## PDF
ბინის „See presentation / Download PDF“ — თითოეული ბინისთვის PDF დაგენერირდება build-ის დროს მოწოდებული შაბლონით (2 გვერდი: ყდა + გეგმა/ოთახები/კონტაქტი).

## დიზაინში შესამჩნევი შეცდომები (გავასწორებთ)
„Bedooms“ → Bedrooms · „MARCETING“ → Marketing · „CARRIER“ → Career · ზომები „m“ → „m²“ · რუკაზე დუბაი ჩანს → თბილისი · ფუტერში LinkedIn vs არსებული Instagram.
