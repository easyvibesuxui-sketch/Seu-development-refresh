# Virtual assistant

The left half of the gate leads to `/assistant/`: a walk into the SEU sales showroom, where the
consultant Mariam greets the visitor and shows the scale models; on the Varketili model the
visitor picks a floor, and its plan and apartments open in a drawer. The assistant never
hands over to the website: the only way out is back to the gate. Everything runs on GitHub Pages, typed questions
included: they are answered on the page itself (below); an AI chat (stage 2) would need a small
server and is designed in but not switched on.

## The consultant must never change

Critical: Mariam is one person in every frame.

- **Character sheet** (Kling Element `323255375657562`, stored in the Kling account):
  woman in her early thirties, shoulder-length straight dark brown hair, warm smile,
  dark forest-green tailored blazer, cream silk blouse, small gold hoop earrings,
  slim black trousers, black heels.
- **Reference images** (Kling CDN, also used as the Element's cover and secondaries):
  master portrait (`public/media/assistant-loop.jpg` is its first video frame),
  three-quarter presenting pose, full length.
- **How new shots are made:** stills with `gemini-3-pro-image` image-to-image, passing the
  full-length reference as image 1 (it kept her identity in every test). Kling's
  `kling-image-v3_0_omni` with the Element ignored the binding once and drew a different
  person, so it is not used for her. Videos are image-to-video from those stills, with the
  same frame as first and last frame where the clip must loop or hand over.
- **Check every clip** against the references before it ships; anything that drifts is
  regenerated, never used.
- **Changing the set, not her:** the Green Yard vitrine (two 19-storey towers) and the Vasilisko
  vitrine (12 storeys; four surplus storeys cut out of the generated model) were redrawn with
  `gemini-3-pro-image` on the showroom still, then only the vitrine was composited back onto the
  original, so Mariam's pixels never changed. The same patch was tracked into `greet` frame by
  frame (SIFT homography, person segmentation keeps her in front). The walk-in (`entry`) was
  regenerated with the original prompt from the corrected door still to the corrected showroom
  still (the door view's vitrines were redrawn the same way, with the showroom as reference),
  because a flat patch cannot follow the moving camera; her face was checked frame by frame.
- **Voice:** one voice, ElevenLabs preset "Sienna" through Higgsfield (`text2speech_v2`,
  variant `elevenlabs`), laid over the clips; the clips themselves carry no audio. Each line of
  `LINES` is one file, `public/assistant/voice/<line>-<lang>.mp3`, listed with its source URL in
  `src/data/voice.json`; the deploy fetches them (`scripts/fetch-voice.mjs`) because the voice
  CDN is not reachable from the authoring container. A line without a file stays silent and the
  subtitles carry it. The assistant, like the site, never states a price.
  clips; the clips are generated without audio.

## Scenes (stage 1)

| Scene     | Media                                            | What the visitor can do                     |
|-----------|--------------------------------------------------|---------------------------------------------|
| door      | `assistant/door.jpg`                             | Come in (starts the walk-in), pick ქარ/EN    |
| walk-in   | `assistant/entry.(webm/mp4)` door → showroom     | Skip                                        |
| greet     | `assistant/greet.(webm/mp4)` on the showroom     | Quick replies, click a model                |
| showroom  | `assistant/showroom.jpg` with model hotspots     | Click a model, quick replies, chat panel    |
| zoom      | showroom zooms into the model (→ close-up)       | —                                           |
| block     | `assistant/maquette-varketili.jpg`, floor bands  | Point at a floor, or pick block + floor     |
| finished  | showroom zoomed on Green Yard / Vasilisko        | Show me Varketili, back to the showroom     |
| drawer    | `AssistantFloorDrawer`: floor plan → apartment   | Open a flat, request a call (inline form)   |

The floor bands come from `FACADES` in `src/data/assistant.ts`: the front face of each built
block on the close-up, in percent of the frame, split evenly by the block's floor count. A new
close-up means re-measuring them.

All buttons, hotspots and (later) AI answers dispatch the same actions
(`goToModel`, `openFloor`, `say`…), so the chat and the clicks always play the same way.

## Typed questions (no server)

"Ask Mariam" takes free text. `answerFor` in `src/data/assistant.ts` matches the question's
stems (Georgian and English) against `ANSWERS`, first match wins, so order matters: price
before apartment, Green Yard and Vasilisko before location. A topic either runs an action
(Mariam then says that scene's recorded line) or answers in words only; `floorIn` reads
"block 7, floor 5" / "მე-7 კორპუსის მე-5 სართული" and opens that floor. Mariam answers in the
language the question was typed in. Prices are never named: price questions, and anything
unmatched, end with the call form. Text-only answers have no recording; the subtitles carry them.

## Stage 2: AI chat

`POST /chat` on a Cloudflare Worker holding the Anthropic API key. The model gets the
project and inventory data and tools that map onto the actions above; it answers only from
that data and hands anything else to a human. The site keeps working without it.
