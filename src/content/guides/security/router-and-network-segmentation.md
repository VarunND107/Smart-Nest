---
title: Router security and network segmentation
summary: How to harden your router and keep smart devices on a separate network, with a realistic view of what guest networks and VLANs do and don't achieve.
order: 2
level: intermediate
tags: [router, network, security, wifi]
related: [secure-your-smart-home-checklist, home-network-for-smart-devices, firmware-updates-and-end-of-support, wifi-and-connectivity-problems]
---

Your router is the gateway between everything in your home and the internet. Hardening it and separating devices limits how far a problem can spread.

## Harden the router first

1. **Change the admin password** and username if possible.
2. **Update the firmware.** If your internet provider manages the router, ask them to update it.
3. **Use WPA2 or WPA3** with a long passphrase.
4. **Disable WPS**, which has known weaknesses.
5. **Disable remote administration** from the internet.
6. **Review UPnP.** It lets devices open ports automatically and is a common source of exposure. Turn it off unless something you use needs it.
7. **Do not forward ports** to cameras or recorders unless you fully understand the risk. Prefer the vendor's secure remote-access method.

## Why segment

If a cheap device is compromised, you want it to be unable to reach your laptop, phone and files. A separate network for smart devices limits that.

## Option 1: the guest network

Most home routers have a **guest Wi-Fi**. Devices on it can reach the internet but, with **client isolation** enabled, cannot see devices on your main network.

Pros: easy, free. Cons:

- Devices on the guest network may be isolated from **each other**, so a hub and its devices might not see one another.
- Your phone on the main network may not be able to control a guest-network device **locally**; it works through the vendor's cloud instead. Casting and some local-control features break.
- Not all routers allow the guest network to use 2.4 GHz.

Test one device before moving everything.

## Option 2: VLANs and a second SSID

Prosumer routers and managed switches can create **VLANs** with firewall rules that allow only what you specify, for example "phone may talk to the hub, but the hub may not talk to the laptop". This gives the best control and also the most setup, so most households do not need it.

## What segmentation does not fix

- It does not protect your **cloud accounts**. Use strong passwords and 2FA ([accounts guide](/learn/accounts-passwords-and-2fa)).
- It does not fix **unpatched** devices. Keep updating ([firmware guide](/learn/firmware-updates-and-end-of-support)).
- It does not stop the device from sending data to its vendor. See [what devices collect](/learn/data-privacy-what-devices-collect).

## Practical plan

1. Harden the router.
2. Put cameras, plugs and bulbs on the guest or IoT network if they still work there.
3. Keep phones, laptops and your hub (if it needs local access to them) on the main network.
4. Re-test each device after the move.

If a device stops working after the move, see [Wi-Fi and connectivity problems](/learn/wifi-and-connectivity-problems).
