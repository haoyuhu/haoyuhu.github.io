Agent IDEs feel like programming after the abstraction ladder moved up one rung. The thing I manipulate is less often a file, class, or function, and more often an agent with a role, context window, tool access, memory, and stopping conditions.

That shift matters. A good agent workflow is not just writing code faster; it is designing a worker. I am specifying:
- what the agent knows
- what it can touch
- how it asks for help
- how success is checked

**The nouns changed, but the verbs did not.** I still decompose tasks, define interfaces, constrain behavior, debug failures, and tighten feedback loops. Prompt, tool schema, eval, and handoff are just higher-level control surfaces.

The mistake is to read agent as magic and stop engineering. An agent that cannot be inspected, bounded, and tested is not a new paradigm; it is a vague script with confidence. The frontier is not whether the IDE can spawn agents. It is whether I can reason about those agents with the same discipline I apply to code.

<u>The unit of composition is shifting from files to workers.</u> That is real. But it is a change in abstraction, not an escape from programming. We are still programming, just one layer higher, where orchestration matters as much as implementation.

**References**
- Andrej Karpathy, X post on agent IDEs as a higher level of programming, 2026.
