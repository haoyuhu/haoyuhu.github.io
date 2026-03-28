**Idea**

I keep coming back to the same pattern: chat history exists in two inconvenient forms — screenshot OCR for the messy past, and message streams for the clean future. The useful system is probably one pipeline that handles both.

Moonshot feels like a good fit for the screenshot side. Not just plain OCR cleanup, but turning OCR output into a structured conversation object: speakers, timestamps, quoted replies, topic shifts, action items, and uncertainty markers. Once the structure exists, the more interesting step is **drill-down interpretation**: ask what happened here, what decision was made, what is missing, what follow-up is implied.

**Capture strategy**

- **Backfill:** use a WeChat dump to sync historical chat data where possible.
- **Incremental ingestion:** use Wechaty as a cloud message consumer for new messages.
- **Fallback:** when the only artifact is a screenshot, run OCR, then let Moonshot normalize and interpret it.

The key is to converge all three inputs into the same schema. A screenshot-derived message should look like a native message, just with lower confidence and stronger provenance links back to the image crops.

**What matters**

I would not optimize for perfect reconstruction. I would optimize for **searchable conversational memory**: enough structure to index, enough evidence to verify, enough model reasoning to summarize or explain.

The hard parts are predictable: OCR noise, missing metadata, image order, duplicated content, and privacy boundaries. So the model should annotate uncertainty, never silently invent missing fields, and always keep the raw evidence nearby.

This feels less like chat archiving and more like building a usable interface over fragmented conversation history.
