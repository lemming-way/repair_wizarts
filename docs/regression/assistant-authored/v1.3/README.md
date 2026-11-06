# Assistant-authored test articles v1.3

This directory contains synthetic fixtures authored for frontend article-catalog testing.
They are separate from the three freelancer-authored regression articles in
`docs/regression/v1.3/`.

All illustrations are original schematic SVG placeholders, not photographs.
The articles are test content, not verified repair instructions.

## Articles

- `laptop_overheating.zip` — laptop cooling / overheating.
- `washing_machine_drain.zip` — washing-machine drainage.
- `bicycle_brakes.zip` — bicycle braking system.

The ZIP files use the v1.3 package structure: root `article.json` and `media/`.
They are intentionally included under `docs/` so `npm run articles:build`
discovers them together with the freelancer-authored articles.
