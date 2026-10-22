---
title: An automation isn't triggering
summary: A diagnostic checklist for rules that don't run, run at the wrong time, or run twice, covering triggers, conditions, time zones and offline devices.
order: 4
level: intermediate
tags: [automation, troubleshooting, offline, voice]
related: [automation-basics, designing-automations-safely, device-offline-troubleshooting-flow, lighting-automations]
---

An automation has a **trigger**, optional **conditions** and **actions** (see [automation basics](/learn/automation-basics)). It can fail at any of the three.

## Step 1: Run the actions manually

Use the app's *run now* or *test* option. If the actions do nothing, the problem is the device, not the rule. See the [offline flow](/learn/device-offline-troubleshooting-flow). If the actions work, the problem is the trigger or conditions.

## Step 2: Check the trigger

- **Time triggers:** confirm the time, the days of the week, and the **time zone** set in the app. A wrong time zone is a classic cause.
- **Sunrise and sunset:** check the home location set in the app is correct. Offsets such as "30 minutes before sunset" depend on it.
- **Sensor triggers:** check the sensor reports the event at all. Open the app's history. A battery sensor that is low or out of range misses events.
- **Presence triggers** based on phone location need location permission and battery optimisation switched off for the app, or they fire late.
- **Voice or button triggers:** check the phrase and that the right speaker hears it.

## Step 3: Check the conditions

Conditions silently stop a rule. Common ones:

- "Only when it is dark": the light level or sunset time may not match your expectation.
- "Only if someone is home": the presence detection may be wrong.
- "Only on weekdays": this skips weekends as designed.
- Another automation turned the condition off, such as a "vacation mode" switch.

Temporarily **remove conditions** one at a time to find the culprit.

## Step 4: Check for conflicts

- **Two automations** acting on the same device can cancel each other, for example one turns lights on and another turns them off a second later.
- A scene or routine may be run by something else (voice, schedule). Check the logs for what ran.
- If the rule runs **twice**, a trigger may be firing on both "motion" and "no motion", or the same rule exists in two apps.

## Step 5: Check the platform

- Is the rule **enabled**?
- Does it run **locally** or in the cloud? Cloud automations stop when the internet is down.
- Are the devices all in the **same ecosystem**? A rule in one app cannot control devices that exist only in another unless they are shared via Matter or a link.
- Has the app or hub been **updated** recently? Re-save the automation after an update.

## Step 6: Look at the logs

Most platforms show a history of rule runs with the reason for a skip. Use it.

## Prevent repeats

- Build **one automation at a time** and test it before adding the next.
- Keep names descriptive.
- Add a notification action to your important automations, so you know when they run.
- Read [designing automations safely](/learn/designing-automations-safely) for failure-proof patterns.
