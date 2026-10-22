---
title: Smart sensors: motion, door, temperature and leak
summary: The four sensors worth owning first, how each works, how long batteries last, and how to place them so they actually trigger.
order: 8
level: beginner
tags: [sensor, automation, battery, zigbee, security]
deviceCategory: sensor
related: [security-and-away-automations, lighting-automations, hubs-and-gateways, how-smart-devices-connect]
---

Sensors are what turn a remote-control setup into an automated one. They report that something happened, and your rules decide what to do next.

## The common types

**Motion (PIR) sensors** detect the heat of a moving person or animal. Use them for hallway lights and for "someone is home" logic. They have a detection cone, and pets can trigger them unless the sensor offers pet immunity.

**Door/window contact sensors** have two parts: a sensor and a magnet. They report open or closed when the magnet moves away. Use them for entry alerts and for "AC off if the window stays open".

**Temperature and humidity sensors** give room readings for climate automations and to spot damp that leads to mould.

**Water-leak sensors** sit on the floor near a washing machine, water purifier, geyser or under a sink. A small probe detects water and triggers a phone alert or a siren.

## Battery and connectivity

Most sensors run on **coin cells** or AA batteries and use low-power radios such as Zigbee or Thread, which is why they usually need a hub or border router. See [how devices connect](/learn/how-smart-devices-connect) and the [hub guide](/learn/hubs-and-gateways). Battery life is typically measured in months to a couple of years depending on how often the sensor fires, but the maker's figure is a best case. Pay attention to low-battery warnings.

## Placement that works

- **Motion:** mount about 2 m high, facing across the room so people walk *across* the field of view, which triggers more reliably than walking straight toward the sensor. Keep away from heaters, AC vents and windows in direct sun, which cause false triggers.
- **Door/window:** fix the sensor on the frame and the magnet on the moving part, with the gap under a centimetre or as the maker specifies. Align the marks on both parts.
- **Leak:** lay it flat at the lowest point where water would collect, not on a shelf.
- **Temperature:** keep it away from sunlight, kitchens and AC outlets for honest readings.

## Test after install

Walk in front of the motion sensor, open the door, drop a wet cloth on the leak sensor, and check the app shows each event within a second or two. If not, check signal strength; adding a mains-powered Zigbee device between the hub and the sensor often fixes it.

## Pairing with automations

Some of the most useful rules need only one sensor: a motion-activated night light, a door alert when you are away, or a leak notification. Ideas are in [security and away automations](/learn/security-and-away-automations) and [lighting automations](/learn/lighting-automations). For safety sensors like smoke and gas, read [smoke and gas detectors](/learn/smoke-and-gas-detectors) first.
