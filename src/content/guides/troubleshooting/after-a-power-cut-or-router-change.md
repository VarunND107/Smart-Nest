---
title: After a power cut or router change
summary: Why devices stay offline after the power returns or you change your Wi-Fi, and the order to bring everything back up in.
order: 7
level: beginner
tags: [troubleshooting, power, router, offline, wifi, india]
related: [device-offline-troubleshooting-flow, home-network-for-smart-devices, hubs-and-gateways, connecting-a-device-to-wifi]
---

Two events cause most "everything is offline" calls: a **power cut** and a **change of router, Wi-Fi name or password**.

## After a power cut

When power returns, everything restarts at once. The router may take several minutes to be ready, but devices try to join immediately. Some fail and do not retry for a long time.

### Restart in order

1. **Modem or ONT and router.** Let them fully start. The internet light should be steady.
2. **Hub or gateway.** Wait until its light shows it is online.
3. **Mains devices:** plugs, switches, bulbs, cameras. Many reconnect on their own within a few minutes.
4. **Battery devices** last. Sensors usually rejoin when a mesh path is available.

### If some devices stay offline

- **Power-cycle only those devices.** Unplug for 10 seconds and plug in again.
- **Check the router's connected-device list** to see whether they joined.
- If the hub lost its configuration, restore from backup if it has one.
- Check **clock-dependent** devices: schedules can fail if a device lost the time and has not re-synced.

### Prevent it

- Put the router, modem and hub on a small **UPS or DC backup**. It prevents the whole reboot dance during brief cuts.
- Use a **surge protector** for sensitive equipment.
- Set smart bulbs and plugs to a sensible **power-on state**, so lights do not all come on at full brightness at night.

## After changing the router or Wi-Fi

Devices remember the old Wi-Fi name and password. If either changes, they cannot find the network.

### Easiest: keep the old details

Set the new router to use **exactly the same Wi-Fi name (SSID), password and security type** as before. Most devices will then reconnect without any further work. Use a 2.4 GHz band with the same name.

### If you must change them

You will need to **re-pair** each Wi-Fi device. Plan to do it room by room.

1. Write down your list of devices before you start.
2. Put each device in pairing mode and re-add it ([connecting a device to Wi-Fi](/learn/connecting-a-device-to-wifi)).
3. Reserve addresses for important devices in the new router.
4. Re-check guest networks, MAC filters and band settings. The new router may use defaults that block 2.4 GHz-only devices.

### Hubs and Thread

A new router changes your network, and **hubs and border routers** may need to be restarted so they register with it. Zigbee and Z-Wave devices live on the hub's own radio network and normally keep working.

## Check that it worked

Test a few devices from the app, then from mobile data, to confirm remote access. If something remains offline, follow the [offline flow](/learn/device-offline-troubleshooting-flow).
