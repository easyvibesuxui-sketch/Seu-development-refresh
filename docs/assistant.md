# Virtual assistant

The left half of the gate leads to `/assistant/`: a walk into the SEU sales showroom, where the
consultant Mariam greets the visitor, shows the scale models and hands over to the website's
visual search. Stage 1 runs entirely on GitHub Pages; the free-text AI chat (stage 2) needs a
small server (Cloudflare Worker + Anthropic API) and is designed in but not switched on.

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
- **Voice:** one fixed voice for both languages, recorded separately (TTS) and laid over the
  clips; the clips are generated without audio.

## Scenes (stage 1)

| Scene     | Media                                            | What the visitor can do                     |
|-----------|--------------------------------------------------|---------------------------------------------|
| door      | `assistant/door.jpg`                             | Come in (starts the walk-in), pick ქარ/EN    |
| walk-in   | `assistant/entry.(webm/mp4)` door → showroom     | Skip                                        |
| greet     | `assistant/greet.(webm/mp4)` on the showroom     | Quick replies, click a model                |
| showroom  | `assistant/showroom.jpg` with model hotspots     | Click a model, quick replies, chat panel    |
| zoom      | showroom zooms into the model (→ close-up)       | —                                           |
| project   | live 3D map of the project (`GateMap`)           | Visual search / project page, back          |

All buttons, hotspots and (later) AI answers dispatch the same actions
(`goToProject`, `say`, `openSearch`…), so the chat and the clicks always play the same way.

## Stage 2: AI chat

`POST /chat` on a Cloudflare Worker holding the Anthropic API key. The model gets the
project and inventory data and tools that map onto the actions above; it answers only from
that data and hands anything else to a human. The site keeps working without it.
