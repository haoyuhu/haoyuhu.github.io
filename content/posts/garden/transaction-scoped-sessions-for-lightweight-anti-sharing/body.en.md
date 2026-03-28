**Idea**
Treat one user operation as a transaction, even if it spans several HTTP requests. The client proves continuity from the *previous* transaction before the server issues a fresh session for the current one.

**Flow**
- Preflight: client sends `api_key`, previous `session_id` (empty on first run), and `hash(phone)` as soft device context.
- Server allows if `api_key` is valid and the previous `session_id` matches the last stored value for that key. If the server has no stored value yet, allow.
- Server mints `new_session_id = hash(salt + api_key + timestamp)`.
- Store two things:
  - **runtime session** for the current transaction, `runtime_ttl ≈ 10 min` (or much shorter, e.g. 60s for screenshot-style operations)
  - **last-session record** for prechecking the next transaction, `del_ttl ≈ 30 days`
- Every in-transaction request carries `api_key + session_id`.
- When the transaction ends, the client discards the session and the server deletes the runtime record.

**Failure handling**
If the client dies mid-transaction, let `runtime_ttl` or a max-call cap expire it naturally. If state gets corrupted, reset the server-side stored session to empty and allow the next preflight to re-enter the cycle.

**What this buys me**
**This is friction, not security.** It adds continuity and some anti-sharing resistance, but it is not strong device binding. A determined actor can still keep a session alive and resell access, so **daily rate limits are still necessary**. Also, if the client stores the previous session in a local file or iCloud, decide explicitly whether multi-device sync is a feature or a bug.
