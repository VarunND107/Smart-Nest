---
title: Designing automations safely
summary: Failure-proof principles: fail safe, keep manual control, never automate hazards or access, and test what happens when things go wrong.
order: 6
level: intermediate
tags: [automation, safety, security, plug, lock]
related: [automation-basics, automations-not-triggering, smart-plugs, smart-locks]
---

A good automation is boring: it does the helpful thing, and when something goes wrong it fails in a harmless way. These principles apply to every rule.

## 1. Fail safe

Ask of every rule: **what happens if this stops working halfway?** Examples:

- A light left on is harmless. A heater left on is not.
- A door left locked is harmless. A door left **unlocked** is not.
- A rule that turns something on **must** have a defined way to turn it off, such as a timer or a second rule.

## 2. Keep manual control

- Every smart switch or bulb must still be usable with the **physical switch**.
- Keep a **mechanical key** for every smart lock.
- Make sure guests and family can use the house when the Wi-Fi, the app or the phone does not work.
- Do not remove a normal wall switch so the only control is an app.

## 3. Never automate hazards

> **Safety:** Do not use automations to control heating appliances, gas or anything that can cause fire or injury if left on, unless the device is specifically designed and rated for it and you have independent safety cut-offs.

- No heaters, irons or geysers on a standard smart plug.
- No homemade gas shut-offs.
- No automations that can disable smoke or gas alarms.

## 4. Never automate access

- Do not let a **camera**, **doorbell press**, **voice command alone**, **location trigger alone** or **schedule** unlock a door.
- Use a PIN, fingerprint or an explicit confirmation on the phone for unlocking.
- Review the list of people and services with access periodically.

## 5. Watch the loops

Rules that trigger each other can loop. "When light A turns on, turn on light B" and "when B turns on, turn on A" is harmless; "when temperature drops, turn on the heater; when the heater is on, turn on a fan that cools it" is not. Add conditions, delays and cool-downs to break loops.

## 6. Think about the unusual cases

- **Power cut:** what state does the device return to?
- **Internet out:** does the rule need the cloud?
- **Phone dead:** can people still get in?
- **A guest in the house:** will presence detection get it wrong?
- **Daylight-saving or time zone settings:** do schedules still make sense?

## 7. Test deliberately

1. Run the rule manually, then let it run on its real trigger.
2. Simulate failure: turn off the Wi-Fi, take out a sensor battery, and see what happens.
3. Check the history to confirm it did what you expected.
4. Re-test after updates or router changes.

## 8. Be notified of the important ones

Add a notification action to any rule that matters ("Garage left open", "Leak detected"). Silent failure is the worst kind.

## 9. Keep a short list

Write down each rule, why it exists and how to disable it. When someone else in the house needs to help, they can.

Related: [automation basics](/learn/automation-basics), [security and away automations](/learn/security-and-away-automations), and [troubleshooting automations](/learn/automations-not-triggering).
