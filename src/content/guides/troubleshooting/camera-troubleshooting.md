---
title: Camera troubleshooting: lag, no alerts, bad night vision
summary: Fixes for the common camera problems: dropped video, missing notifications, false alerts, washed-out night images and storage issues.
order: 5
level: intermediate
tags: [camera, troubleshooting, wifi, storage, privacy]
related: [smart-cameras, camera-placement-and-mounting, wifi-and-connectivity-problems, firmware-updates-and-end-of-support]
---

## Video is laggy, freezes or drops

1. **Signal first.** Cameras need strong, steady Wi-Fi. Check the signal strength in the app. Below about -70 dBm expect trouble. See [Wi-Fi and connectivity problems](/learn/wifi-and-connectivity-problems).
2. **Lower the resolution or bitrate** in the camera or app settings. A lower setting streams more smoothly.
3. **Move to 2.4 GHz** if it is on a weak 5 GHz link, or the other way if 2.4 GHz is congested.
4. **Wire it** with Ethernet or PoE if you can. This is the most reliable fix.
5. **Limit simultaneous viewers.** Many people viewing the same camera strain a weak upload speed.
6. **Check your internet upload speed.** Remote viewing needs upload bandwidth, which is often lower than download.

## No notifications

- **Phone permissions:** allow notifications for the camera app, and turn off battery optimisation that kills the app in the background.
- **Do not disturb or focus modes** may block alerts.
- **App settings:** check that motion alerts are enabled and the schedule is correct.
- **Camera settings:** check the detection zone and sensitivity.
- Check whether notifications require a **cloud subscription**.

## Too many false alerts

- Draw **activity zones** to exclude trees, roads and shared corridors.
- Lower the **sensitivity**.
- Enable **person or vehicle detection** if available, instead of general motion.
- Spiders, insects and moths attracted to the IR lights cause night alerts. Clean the lens and consider moving the camera away from lights.

## Night images are washed out or show glare

- A camera pointing **through glass** reflects its own IR light. Move it outside or away from the glass.
- A nearby **wall or railing** can bounce IR back. Re-aim to avoid close surfaces.
- Clean the lens. Dust and spider webs scatter IR light.
- Some cameras offer **colour night vision** that relies on ambient light.

## Recordings are missing

- **SD card:** use a high-endurance card of a supported size, check it is formatted in the camera, and replace it every year or two. Cards wear out.
- **Cloud:** check the subscription is active, and the retention period.
- **Recording mode:** continuous recording fills storage faster than event recording.
- **Time:** make sure the camera's clock and time zone are correct, or you will look in the wrong place.

## The camera goes offline

Follow the [offline troubleshooting flow](/learn/device-offline-troubleshooting-flow). Cameras on batteries may be offline because the battery is empty or the unit is in power-saving mode.

## Still stuck

- Update the camera firmware ([firmware guide](/learn/firmware-updates-and-end-of-support)).
- Restart the camera, then the router.
- As a last resort, factory reset and set up again, then check placement ([camera placement](/learn/camera-placement-and-mounting)).
