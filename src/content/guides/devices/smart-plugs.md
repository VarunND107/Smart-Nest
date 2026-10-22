---
title: Smart plugs
summary: What a smart plug can and cannot safely control, how to read its load rating, and the Indian socket sizes that trip people up.
order: 1
level: beginner
tags: [plug, energy, automation, safety, india]
deviceCategory: plug
related: [energy-monitoring, connecting-a-device-to-wifi, device-offline-troubleshooting-flow, designing-automations-safely]
---

A smart plug sits between a wall socket and an appliance and switches the power on or off on command or on a schedule. It is the cheapest first smart device and works with almost anything that **starts when power is applied**.

## Good uses

- Table lamps, fans, phone chargers, decorative lights.
- A coffee maker or kettle *that you have already loaded and that is designed to be left plugged in* (see the safety note).
- A router, set-top box or modem you sometimes need to power-cycle remotely.
- Devices where you want **energy monitoring** (see [energy monitoring](/learn/energy-monitoring)).

## Poor uses

- Anything that needs a button press after power returns (many TVs and printers go to standby instead of on).
- Appliances that need a clean shutdown, such as computers and NAS drives.
- **Heavy loads** beyond the plug's rating.

## Read the load rating

The plug's label shows a maximum current in amps and often a maximum wattage. At 230 V, watts ≈ amps × 230.

| Rating | Roughly supports |
| --- | --- |
| 6 A | About 1,400 W |
| 10 A | About 2,300 W |
| 16 A | About 3,600 W |

Heating loads like geysers and room heaters, and compressor loads like air conditioners and refrigerators, draw a lot at start-up. Use a plug only if its rating clearly exceeds the appliance's rated power with a wide margin, and prefer plugs sold for that purpose.

> **Safety:** Never run a heater, iron, geyser or similar heating appliance unattended through a smart plug unless the plug is explicitly rated for it. Heat plus a failed relay is how fires start. For air conditioners, use the manufacturer's own smart control or an IR controller instead (see the [IR and AC guide](/learn/ir-blasters-and-smart-ac)).

## Indian socket sizes

Indian homes usually have 6 A sockets for small devices and 16 A sockets for heavy appliances, with different pin sizes. A plug built for one will not fit the other without an adapter. Using adapters to force a mismatch overheats connections. Buy the size you actually have.

## What to look for when buying

- Stated load rating and a recognised safety certification mark.
- Local control or at least a clear statement of what happens when the internet drops.
- **Restore behaviour** after a power cut: does it return on, off, or its last state?
- App quality and update history. See [firmware and end of support](/learn/firmware-updates-and-end-of-support).

## Setup and problems

Most plugs are Wi-Fi 2.4 GHz devices. Follow [connecting a device to Wi-Fi](/learn/connecting-a-device-to-wifi). If it drops offline, work through the [offline flow](/learn/device-offline-troubleshooting-flow). Before automating, read [designing automations safely](/learn/designing-automations-safely).
