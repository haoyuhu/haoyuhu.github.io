My current mental model is that **agentic RL** is easiest to reason about as three interacting layers, not one monolithic capability.

**1. Adaptation over time: memory + self-improvement**
These are often discussed together, and for good reason. Memory lets an agent carry useful state across steps, episodes, or tasks. Self-improvement is the stronger version: the agent does not just act better in the current rollout, it changes how it performs over time. This is the bucket I look at when I care about <u>long-term performance change</u>: learning from mistakes, stabilizing good strategies, reusing prior experience, or becoming more sample-efficient as experience accumulates.

**2. In-episode competence: planning + tool use + reasoning**
These also naturally cluster. Planning is about searching over futures, tool use is about expanding the agent’s effective action space, and reasoning is about structuring intermediate computation. I treat this as the **base competence layer**: if the model weights were fixed, how well could the agent still decompose a task, choose the right tool, and stay coherent across multiple steps?

**3. Environment interface: perception**
Perception is a bit different. It depends heavily on the environment: what signals are available, how noisy they are, how partial or delayed they are, and whether the world is text-only or multimodal. A surprising number of failures that look like weak reasoning are really perception bottlenecks upstream.

This is not a clean ontology. It is just a practical lens. When an agent underperforms, I usually ask: is it failing to improve over time, failing to think well in the moment, or simply failing to see the environment clearly?
