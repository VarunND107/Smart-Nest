---
title: Getting your home network ready for smart devices
summary: Router placement, 2.4 GHz vs 5 GHz, IP reservations, power cuts and when to add a mesh node, because most smart-home problems are network problems.
order: 6
level: intermediate
tags: [network, wifi, router, india, troubleshooting]
related: [how-smart-devices-connect, router-and-network-segmentation, after-a-power-cut-or-router-change]
---

When a smart device misbehaves, the cause is more often your network than the device. A small amount of preparation prevents most of it.

## Place the router well

- Put it **central and raised**, in the open, not inside a cabinet, behind a TV or next to a microwave.
- Thick concrete and brick walls, and large metal objects (fridges, steel almirahs), block Wi-Fi heavily. Count how many walls lie between the router and the farthest device.
- If a room is weak, a **mesh node or wired access point** in the middle beats a cheap plug-in repeater, which halves throughput.

## Understand 2.4 GHz and 5 GHz

| | 2.4 GHz | 5 GHz |
| --- | --- | --- |
| Range | Longer | Shorter |
| Speed | Lower | Higher |
| Congestion | High (neighbours, Bluetooth, microwaves) | Lower |
| Smart-device support | Nearly universal | Often missing |

Many smart devices only join **2.4 GHz**. If your router uses a single name for both bands, some phones and devices get confused during setup. Pairing steps are in [connecting a device to Wi-Fi](/learn/connecting-a-device-to-wifi).

## Make addresses predictable

Your router hands out addresses (DHCP). Devices whose address changes can disappear from apps that track them by address.

- Give important devices a **DHCP reservation** (also called static lease) in the router, so a camera or hub always gets the same address.
- Avoid assigning addresses manually inside devices unless you know your router's range.

## Plan for power cuts

Power cuts are routine in many places, and they restart your router and devices in an unpredictable order.

- Put the **router and hub on a small UPS or DC backup** if your internet service stays up during cuts. Fibre ONTs and routers draw little power.
- Expect smart bulbs to return to *on* or their last state after a cut, depending on the model.
- If devices stay offline after the router returns, see [after a power cut or router change](/learn/after-a-power-cut-or-router-change).

## Do not overload a basic router

Cheap routers can struggle with 25 or more connected clients. Signs: devices dropping at random, slow response, router restarts. Fixes in order of cost:

1. Reboot and update the router's firmware.
2. Move chatty devices (cameras) to wired Ethernet where possible.
3. Upgrade to a router or mesh system rated for many devices.

## Keep it secure

Use WPA2 or WPA3, change the default router admin password, and consider a separate guest network for smart devices. Details are in [router and network segmentation](/learn/router-and-network-segmentation).
