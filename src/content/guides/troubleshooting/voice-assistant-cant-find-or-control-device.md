---
title: The voice assistant can't find or control a device
summary: Why "device not responding" or "I couldn't find that" happens, with fixes for naming, account linking, rooms and stale connections.
order: 6
level: beginner
tags: [voice, troubleshooting, ecosystem, offline]
related: [voice-assistants-rooms-and-naming, smart-speakers-and-displays, device-offline-troubleshooting-flow, hubs-bridges-and-ecosystems]
---

## "I couldn't find a device called…"

The assistant did not match what you said to a device name.

1. **Check the exact name** in the assistant's app. Say it just as it is written.
2. **Rename** devices to short, distinct names ([naming guide](/learn/voice-assistants-rooms-and-naming)).
3. **Check the room.** If you ask the speaker in the bedroom to "turn off the light", it looks in that room first.
4. **Sync devices.** Ask the assistant to *discover devices*, or refresh the list in the app.

## "The device isn't responding"

The assistant found it but cannot reach it.

1. **Is the device online in its own app?** If not, fix that first with the [offline flow](/learn/device-offline-troubleshooting-flow).
2. **Is the account link still valid?** Linking the vendor's account to the assistant can expire after a password change or an app update. In the assistant app, unlink and relink the skill or service.
3. **Is the vendor's cloud down?** Check the vendor's status page.
4. **Was it removed or renamed** in the vendor app? Resync the devices.

## The wrong device responds

- Two devices share similar names. Rename one.
- Rooms or groups overlap. Check the group's members.
- Two speakers answered. Adjust their placement or sensitivity.

## It worked yesterday

- A **firmware or app update** can break links. Update everything and relink.
- A **router change** can break local control. See [after a power cut or router change](/learn/after-a-power-cut-or-router-change).
- **Changed Wi-Fi password:** devices need to be re-joined.
- **Cloud-to-cloud services** can be revoked by the vendor, requiring a re-authorisation.

## Voice recognition problems

- Speak the command **in one go**, naturally.
- Check the **language and accent settings** in the assistant.
- If you use multiple languages, test the device names you actually say.
- Reduce background noise, and keep the speaker away from the TV and walls.
- Retrain the **voice match** if your assistant offers it.

## Multiple assistants and ecosystems

Using several assistants and apps on the same devices causes duplicated, mismatched devices. Prefer one primary ecosystem, and use Matter for sharing ([Matter explained](/learn/matter-explained)).

## When it is the speaker

- Check the speaker's own Wi-Fi.
- Restart it.
- Make sure its microphone is not muted.
- Check the assistant's status page for outages.

If none of this helps, see the [speaker guide](/learn/smart-speakers-and-displays) or [when to reset or ask for help](/learn/when-to-reset-or-ask-for-help).
