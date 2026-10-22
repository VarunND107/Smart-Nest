---
title: Automation basics: triggers, conditions and actions
summary: The three-part model behind every smart-home rule, with examples, and how to design a rule that behaves the same way every time.
order: 1
level: beginner
tags: [automation, basics, routines]
related: [lighting-automations, designing-automations-safely, automations-not-triggering, voice-assistants-rooms-and-naming]
---

Every automation, in every app, is built from the same three parts. Once you know them you can read any rule and design your own.

## Trigger, condition, action

- **Trigger:** the event that starts the rule. *"When the front door opens."*
- **Condition:** an optional check that must be true. *"…and it is after sunset."*
- **Action:** what happens. *"…turn on the hall light for 3 minutes."*

Read it aloud as a sentence: **When** (trigger) **and if** (condition), **then** (action). If it does not read naturally, simplify it.

## Common triggers

| Trigger | Example |
| --- | --- |
| Time | Every weekday at 7:00 |
| Sun | 20 minutes before sunset |
| Sensor | Motion in the hallway; door opened; temperature above 30 °C |
| Presence | Last person leaves home; first person arrives |
| Device state | The TV turned on |
| Manual | A button, a scene, a voice phrase |

## Common conditions

Time windows, whether it is dark, who is home, a switch such as "guest mode", the state of another device, or a temperature threshold.

## Scenes and routines

A **scene** sets several devices to a preset state at once ("Movie": dim lights, close curtains). A **routine** is a scene attached to a trigger. Build scenes first and let automations call them, so you only edit a preset in one place.

## Design rules that stay reliable

1. **One purpose per automation.** Rules that try to do everything are hard to debug.
2. **Make them idempotent.** Running twice should not cause harm. "Set light to 40%" is safer than "increase brightness".
3. **Include an end.** Anything that turns on automatically should also turn off: a timer, a "no motion for 5 minutes" condition, or a schedule.
4. **Use delays and cool-downs** to avoid flapping when a sensor fires repeatedly.
5. **Decide what manual control does.** If someone turns the light off by hand, should the automation turn it back on? Usually not.
6. **Name everything clearly**, in the form "Hall: night path lighting".
7. **Test one at a time**, and write down the expected result.

## Where the rule runs

- **On the hub or device (local):** keeps working without the internet and is faster.
- **In the cloud:** needs the internet and the vendor's service. Check which one your app uses.

## Start small

A good first set is three rules: a motion night light, a "leaving home" routine that turns off lights and fans, and a door-open alert while you are away. Ideas for each are in [lighting automations](/learn/lighting-automations) and [security and away automations](/learn/security-and-away-automations). When a rule stops working, use [automations not triggering](/learn/automations-not-triggering). Before automating anything that can cause harm, read [designing automations safely](/learn/designing-automations-safely).
