---
title: Hubs and gateways
summary: What features to compare when buying a hub, how many devices it can handle, and what to do if it fails.
order: 13
level: intermediate
tags: [hub, zigbee, zwave, thread, matter, ecosystem]
deviceCategory: hub
related: [hubs-bridges-and-ecosystems, how-smart-devices-connect, matter-explained, device-offline-troubleshooting-flow]
---

A hub or gateway is the central device for non-Wi-Fi smart devices. It connects Zigbee, Z-Wave or Thread devices to your network and phone, and often runs automations locally. The background is in [hubs, bridges and ecosystems](/learn/hubs-bridges-and-ecosystems); this page covers what to compare when buying.

## Features that matter

- **Protocols supported:** Zigbee, Z-Wave, Thread, Bluetooth, Matter. Buy the hub for the devices you plan to own, not for a spec sheet.
- **Local processing:** can automations run without the internet? This decides what survives an outage.
- **Matter support:** can it act as a Matter controller or bridge, so devices are shared with other ecosystems? See [Matter explained](/learn/matter-explained).
- **Ecosystem fit:** does it work with the assistant and app you chose?
- **Capacity:** the maker's maximum number of devices. Plan for well under the limit, since a hub at capacity behaves badly.
- **Backup and restore:** can you export or back up the configuration? If a hub dies, re-pairing 40 sensors by hand is painful.
- **Update policy:** the maker's track record for firmware updates.

## Wired or wireless

If the hub has an Ethernet port, use it. A wired hub is more reliable than one on Wi-Fi and is not affected when Wi-Fi is crowded.

## Placement

- Place it **centrally**, off the floor, with a clear space around it.
- Keep it **a metre or more away from the Wi-Fi router** and USB 3 devices, which can interfere with 2.4 GHz radios.
- Put it on a surge-protected socket, ideally with a UPS, so a power cut does not repeatedly corrupt it. See [home network guide](/learn/home-network-for-smart-devices).

## Growing the mesh

Zigbee and Thread networks improve when you add mains-powered devices that relay signals. If a battery sensor in a far room is weak, add a plug or bulb between it and the hub rather than moving the hub.

## When it fails

1. Check power and network cables, then the hub's indicator light.
2. Restart it, then wait several minutes for devices to rejoin.
3. Check for a hub or app update.
4. See the [offline troubleshooting flow](/learn/device-offline-troubleshooting-flow) and, if needed, [when to reset or ask for help](/learn/when-to-reset-or-ask-for-help).

## Do you need one?

Not until you own devices that require it. A home built entirely from Wi-Fi plugs, bulbs and cameras can skip the hub for a long time.
