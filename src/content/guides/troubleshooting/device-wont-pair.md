---
title: A device won't pair
summary: A ranked list of reasons pairing fails and the fix for each, from pairing mode to router settings to a faulty unit.
order: 3
level: beginner
tags: [troubleshooting, setup, wifi, bluetooth, zigbee]
related: [connecting-a-device-to-wifi, device-offline-troubleshooting-flow, hubs-and-gateways, when-to-reset-or-ask-for-help]
---

Pairing fails for a small number of reasons. Check them in this order.

## 1. The device is not in pairing mode

The most common cause. Check the manual for the exact method and the **indicator pattern** that confirms it.

- Many Wi-Fi devices blink quickly; hold the button for 5 to 10 seconds or switch the power on and off three times.
- Pairing mode often **times out after a few minutes**. Start the app's *Add device* flow right after you trigger it.
- If the light is already blinking slowly, the device may be searching for old Wi-Fi. Reset it first.

## 2. Your phone is on the wrong band or network

Wi-Fi smart devices often need the phone on the **2.4 GHz network**. Turn off mobile data and any VPN, move near the router, and read [connecting a device to Wi-Fi](/learn/connecting-a-device-to-wifi).

## 3. Wrong Wi-Fi password or special characters

Re-type the password carefully. Try a temporary simple password if the real one contains unusual characters.

## 4. Router settings are blocking it

- Guest network or **AP isolation** is on.
- **MAC filtering** is enabled.
- The router is set to **WPA3 only**.
- Too many devices are connected, so the router refuses new ones.

## 5. Bluetooth or location permissions are off

The app uses Bluetooth and sometimes location to find nearby devices. Enable them for the app and turn on the phone's Bluetooth.

## 6. Zigbee, Z-Wave or Thread specifics

- Put the **hub** into *join/search* mode first, then the device.
- Move the device **close to the hub** for pairing, then move it.
- Remove the device from any other hub or app. Many can only belong to one Zigbee network at a time.
- Reset the device with the manufacturer's sequence (often repeated on/off cycles for bulbs).

## 7. The device is already paired somewhere

A second-hand device, or one that was added by a family member, will refuse to pair. Ask them to remove it from their account, then reset the device. See [selling or gifting devices](/learn/selling-or-gifting-devices).

## 8. App, firmware or region problems

- Update the app and your phone's operating system.
- Make sure you chose the correct **region** in the app. Some devices only appear in the region where they were sold.
- Try the maker's **official app** rather than a lookalike.

## 9. The device is faulty

If it still will not enter pairing mode, shows no lights, or fails on two different networks and two phones, it may be faulty. Check the warranty and return window, then see [when to reset or ask for help](/learn/when-to-reset-or-ask-for-help).

## Quick test

Pair it on a **phone hotspot** set to 2.4 GHz. If it pairs there but not on your home Wi-Fi, the cause is your router settings.
