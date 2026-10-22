---
title: Security and away-from-home automations
summary: Practical alert and deterrent rules for when you are out, with the limits of each and the mistakes that cause false alarms or false confidence.
order: 3
level: intermediate
tags: [automation, security, sensor, camera, lock]
related: [smart-sensors, smart-cameras, smart-locks, designing-automations-safely]
---

Automations can notify you and make a house look occupied. They do not replace locks, good habits or a real alarm system.

## Alerts while you are away

### Door or window opened
- **Trigger:** a contact sensor on the main door or a ground-floor window opens.
- **Condition:** nobody is home, or "away mode" is on.
- **Action:** send a phone notification, turn on lights, and start recording on the nearest camera.
- **Gotcha:** delivery visitors will trigger it, so test it with family so they know what to expect.

### Motion inside when nobody is home
- **Trigger:** motion in the hall or living room.
- **Condition:** everyone is away.
- **Action:** notification plus snapshot.
- **Gotcha:** pets cause false alerts. Use pet-immune sensors or limit the rule to rooms the pet cannot enter.

### Water leak
- **Trigger:** a leak sensor detects water.
- **Action:** a loud notification to several people, plus a siren if you have one.
- **Why:** water damage becomes serious quickly. Place sensors near washing machines, water purifiers and under sinks ([smart sensors](/learn/smart-sensors)).

## Make the house look lived-in

- Turn a lamp on at sunset and off at a **randomised** time. A fixed schedule is easy to spot.
- Do not publish your away schedule on social media.

## Home and away handling

- **Privacy mode:** turn indoor cameras **off** when someone is home and **on** when everyone leaves. See [camera and microphone privacy](/learn/camera-and-microphone-privacy).
- **Arrival:** turn on entrance lights when the first person arrives, and send a notification to others.

## What to avoid

> **Safety:** Never automate unlocking a door from a camera, a doorbell press, a schedule or a voice command without a PIN. An automation that can open the door is an attack path.

- Do not depend on a phone-location trigger alone to lock the house. Include a manual check.
- Do not disable a local siren or alarm to quiet false alerts.
- Do not rely on cloud-only notifications for emergencies. If the internet is down, you will not be told.

## Testing and review

- Test each rule with the family present, and from outside the house with mobile data.
- Review the history to see what fired and when.
- Revisit your rules after any new device, a router change or an app update.

## Honest expectations

These rules **notify**. They do not prevent a break-in. If you need real intrusion protection, use a proper alarm system and good physical security. Related: [smart cameras](/learn/smart-cameras), [smart locks](/learn/smart-locks), [designing automations safely](/learn/designing-automations-safely).
