# Burning Token — Tracks / Challenges

Source: `get_hackathon_brief` MCP (authoritative) · Saved 2026-09-09

Six tracks. A project can select **multiple challenges** on the submission form
(there is a "Challenges" field plus "evidence per challenge"), so one build can
compete for more than one prize if it genuinely meets each integration requirement.

---

## Fun Build · NERDCONF — USD 500 cash

**Build:** Something funny, strange, or unexpected people can interact with. Own
format and stack. "A small idea with one great interaction is enough."
Reference for spirit only: [SlapMac](https://slapmac.com/).

**Entry requirements:** Ship a working version someone outside your team can try.
No sponsor integration, AI feature, or business model required. If it needs
particular hardware, list requirements and give judges a way to try it.

**Show us:** Let someone try the main interaction and show what happens. Short demo
+ access to the working build. Should make sense without a long explanation.

**Judging:** Shipping 35 · Originality 25 · Fun 25 · Execution 15

---

## Multiplayer · Convex — USD 500 cash

**Build:** A product where people work, interact, or coordinate through shared data.
AI agents can participate too.

**Entry requirements:** Use Convex to store and sync shared data. Realtime updates
must support a **core** feature. Deploy the frontend on **Convex Static Hosting**
(`convex.site`).

**Show us:** Deployed product in two separate sessions — act in one, show the update
in the other without refreshing, and why that update matters.

**Judging:** Shipping 35 · Usefulness 25 · Realtime behavior 25 · Integration 15

---

## Subscriptions · RevenueCat — USD 500 cash

**Build:** A product with a paid feature or subscription that delivers clear value.

**Entry requirements:** Integrate a RevenueCat SDK. Configure an offer and use
**entitlements** to gate a useful feature. Sandbox/test purchase accepted; real
revenue not required.

**Show us:** Before and after a test purchase. Show the offer, complete the purchase,
show the right user gaining access — **and** what happens when a purchase fails or
access expires. Clearly identify test transactions.

**Judging:** Shipping 35 · Usefulness 25 · Paid experience 25 · Integration 15

---

## Deep Research · Linkup — USD 500 cash

**Build:** A product that combines stored data with web information to help someone
complete a task.

**Entry requirements:** Use Linkup to search and retrieve. The research flow must
**store findings and use them to decide what to investigate next** (i.e. iterative,
not a single search call).

**Show us:** Deployed product completing a task end to end — sources, follow-up
searches, and how findings affect the result.

**Judging:** Shipping 35 · Usefulness 25 · Research quality 25 · Integration 15

---

## Applied AI · Nebius — USD 500 cash

**Build:** An AI tool for a specific task whose results you can check.

**Entry requirements:** Use **Nebius Token Factory** for inference in the main flow.
Evaluate output on a small representative set and measure at least one of: accuracy,
time to complete, or cost per task.

**Show us:** Product processing an input and producing a usable result. Share eval
results, how you measured, and **a case it struggles with**.

**Judging:** Shipping 35 · Usefulness 25 · Output quality 25 · Integration 15

---

## Workflows · Render — USD 900 in credits (500 / 300 / 100)

**Build:** A multi-step background process that completes a useful task, tracks
progress, handles failure, and delivers a result.

**Entry requirements:** Use **Render Workflows**. Include recovery from a failed step.
Handle idempotency if a retry could duplicate records or actions.

**Show us:** Deployed workflow end to end. **Trigger a controlled failure**, show
recovery, verify the final result. Execution status and unresolved errors visible.

**Judging:** Shipping 35 · Usefulness 25 · Reliability 25 · Integration 15

**Note:** credits, not cash — but it's the only track with three placements, so the
odds of placing are meaningfully better.
