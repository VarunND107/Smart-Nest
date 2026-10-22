---
title: Wi-Fi and connectivity problems
summary: How to diagnose weak signal, congestion, band steering and IP conflicts, and which fix to try first for each symptom.
order: 2
level: intermediate
tags: [wifi, router, network, troubleshooting, offline]
related: [home-network-for-smart-devices, device-offline-troubleshooting-flow, router-and-network-segmentation, camera-troubleshooting]
---

When several smart devices act up together, suspect the network. Match your symptom to the likely cause.

## Symptom guide

| Symptom | Likely cause | Try |
| --- | --- | --- |
| Device drops at the same time each day | Router restarts, scheduled updates, or an ISP reset | Check router logs and schedules; update firmware |
| Only far-away devices drop | Weak signal | Move the router, or add a mesh node or wired access point |
| Everything is slow in the evening | Congestion (neighbours, many devices) | Change channel; move to 5 GHz for phones and laptops |
| New device won't join | 2.4 GHz issue, WPA3-only, MAC filtering | See [connecting a device to Wi-Fi](/learn/connecting-a-device-to-wifi) |
| Device works, then gets a different address | DHCP lease change | Reserve its address in the router |
| Two devices fight | Duplicate IP address | Reserve addresses; restart the router |
| App cannot reach the device only at home | Guest-network isolation | Put the phone and device on the same network |

## Measure before changing

- Check the device's **signal strength** (RSSI) if the app shows it. Roughly -50 dBm is excellent, -70 dBm is marginal, and below -80 dBm is unreliable.
- Use a free Wi-Fi analyser app on your phone to see nearby networks and their channels.

## Fix congestion

1. Set the 2.4 GHz channel to **1, 6 or 11**, whichever is least used near you. Avoid the "auto" option if it keeps changing.
2. Use a **20 MHz channel width** on 2.4 GHz. 40 MHz overlaps more neighbours.
3. Move laptops and phones to **5 GHz** so 2.4 GHz is left for smart devices.
4. Keep the router away from microwaves, cordless phones and baby monitors.

## Fix coverage

- Place the router central and high ([home network guide](/learn/home-network-for-smart-devices)).
- Add a **mesh node or access point connected by cable** where possible. Wireless repeaters halve speed.
- For a camera far from the router, use **wired Ethernet or PoE**.

## Fix address problems

- Give hubs, cameras and servers a **DHCP reservation**.
- Do not use the same address on two devices. A fixed address set inside a device can collide with the router's pool.
- Restart the router after changing network settings.

## Band steering and one-name networks

Routers that use one name for both bands try to move devices to the better band. Some smart devices handle this badly. If a device keeps dropping, create a **separate 2.4 GHz name** for smart devices.

## The router itself

- Update its firmware.
- Reboot it monthly, or on a schedule, if it slows down. Frequent need for reboots means it may be underpowered.
- If you have an ISP-provided router with limited settings, consider adding your own router or mesh system in access-point mode.

When you have done these and one device is still unhappy, go back to the [offline flow](/learn/device-offline-troubleshooting-flow).
