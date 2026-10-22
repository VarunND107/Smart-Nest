---
title: Connecting a device to Wi-Fi (and fixing the 2.4 GHz problem)
summary: The standard pairing sequence step by step, why the phone must be on 2.4 GHz, and what the common error messages mean.
order: 2
level: beginner
tags: [wifi, setup, install, router, troubleshooting]
related: [device-wont-pair, wifi-and-connectivity-problems, home-network-for-smart-devices, before-you-install-checklist]
---

Almost every Wi-Fi smart device pairs the same way. Understanding the steps makes the error messages make sense.

## The usual sequence

1. **Power the device** and wait for it to enter pairing mode. This is often a rapidly blinking light; you may need to hold a button for 5 to 10 seconds or switch a plug on and off several times. The manual shows the exact pattern.
2. **Open the vendor app**, choose *Add device*, and select the product or let the app scan.
3. **Connect through Bluetooth or the device's own Wi-Fi hotspot.** Your phone briefly talks directly to the device.
4. **Send your Wi-Fi details.** The app passes your Wi-Fi name and password to the device.
5. **The device joins your router**, then registers with the vendor's cloud and appears in the app.

If step 4 fails, the device cannot reach your router with those details.

## The 2.4 GHz catch

Many devices support only **2.4 GHz**. During pairing, the device copies the Wi-Fi network your *phone* is on. If your phone is on 5 GHz, the device may receive details it cannot use.

What to do:

- **Move your phone to the 2.4 GHz network.** If your router uses one name for both bands, look in the router settings for a separate 2.4 GHz name or temporarily turn off 5 GHz during pairing.
- **Move close to the router** during setup.
- **Turn off mobile data** on the phone so it does not try to route through the carrier.
- **Turn off a VPN** on the phone while pairing.

## Passwords and names

- Spaces and special symbols in the Wi-Fi password are usually fine, but some older devices struggle with very long passwords or characters like `&`, `'` or `"`. If pairing keeps failing, test with a temporary simpler password.
- The Wi-Fi name must be exact, including capitals.
- Hidden networks sometimes fail; reveal the name temporarily.

## Router settings that block pairing

- **Client or AP isolation** on a guest network prevents the phone from reaching the device. Pair on the main network first.
- **MAC filtering** blocks new devices until you add them.
- **WPA3-only** mode can lock out older devices. WPA2/WPA3 mixed mode is safest.
- Captive-portal or "hotel-style" login networks do not work with these devices.

## After pairing

1. Rename the device by room and role ([naming guide](/learn/voice-assistants-rooms-and-naming)).
2. Check for a firmware update ([firmware guide](/learn/firmware-updates-and-end-of-support)).
3. Test control from the app, then from mobile data, to confirm remote access works.
4. Consider reserving the device's IP address in the router.

If it still will not pair, go to [device won't pair](/learn/device-wont-pair).
