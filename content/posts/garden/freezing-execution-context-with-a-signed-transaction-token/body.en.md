I like treating **transaction creation** as the moment where execution intent becomes concrete.

The shape is simple:

- When creating a transaction, assemble the final config from **tool**, **context**, and **device** information.
- Normalize it into a stable structure.
- Add a salt/nonce and generate a signature over that config.
- Put the **expiration timestamp** into a JWT.
- Return the token together with the resolved list/output and the execution parameters.

On the next call, before actually executing anything:

- verify the JWT is valid and unexpired
- recompute the signature from the submitted config
- compare it with the original signed value
- reject if anything was tampered with

What I like about this pattern is that it turns the first step into a kind of **commit point**. The client can hold the token and parameters, but it cannot quietly rewrite the execution context later. That matters when device capabilities, tool selection, or derived runtime args influence safety, billing, or reproducibility.

A few details matter more than they first appear:

- **Canonical serialization** is everything. If the config is not normalized, signing becomes fragile.
- Sign only the fields that define execution meaning; avoid noisy or ephemeral values.
- Include a **version** field so the signing format can evolve safely.
- Keep the JWT short-lived. Expiry is part of the security model, not just housekeeping.
- Rotate signing keys cleanly.

**The core idea:** do the expensive resolution once, sign the result, and treat later execution as verification rather than re-interpretation.
