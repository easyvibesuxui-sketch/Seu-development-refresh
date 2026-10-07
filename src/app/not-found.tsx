import Link from "next/link";

/*
 * Missing page. Georgian used to live under /ka/; links saved from then land here and are sent
 * on to the same page at its present address before anything paints.
 */
const FROM_KA = `var m=location.pathname.match(/^(.*?)\\/ka(\\/.*|$)/);if(m)location.replace(m[1]+(m[2]||"/")+location.search+location.hash);`;

export default function NotFound() {
  return (
    <main className="tone-dark grid min-h-[100svh] place-items-center bg-seu-ink px-gutter text-center text-white">
      <script dangerouslySetInnerHTML={{ __html: FROM_KA }} />
      <div>
        <p className="eyebrow justify-center text-white">404</p>
        <h1 className="section-title mt-6">გვერდი ვერ მოიძებნა</h1>
        <p lang="en" className="body-copy mt-4 text-white/80">
          Page not found
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            მთავარი
          </Link>
          <Link href="/en/" lang="en" className="btn btn-glass">
            English
          </Link>
        </div>
      </div>
    </main>
  );
}
