/**
 * Two rows of outline lettering that slide in opposite directions with the scroll
 * (driven by `data-drift` in ScrollFX), a breath between the project lists and the filters.
 */
export default function ScrollWords() {
  return (
    <section data-tone="dark" className="tone-dark relative overflow-hidden pt-section" aria-hidden>
      <p className="scroll-words" data-drift="-0.35">
        Varketili <span className="is-solid">·</span> Green Yard <span className="is-solid">·</span> Vasilisko{" "}
        <span className="is-solid">·</span> Varketili
      </p>
      <p className="scroll-words -mt-[0.1em] translate-x-[-30%]" data-drift="0.35">
        Live <span className="is-solid">in the light</span> · Live <span className="is-solid">in the light</span>
      </p>
    </section>
  );
}
