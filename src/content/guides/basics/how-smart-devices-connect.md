---
title: How smart devices connect: Wi-Fi, Bluetooth, Zigbee, Z-Wave and Thread
summary: The main wireless technologies compared on range, power use, hubs and reliability, so you can predict how a device will behave.
order: 2
level: beginner
tags: [wifi, zigbee, zwave, thread, bluetooth, matter, hub, connectivity]
related: [hubs-bridges-and-ecosystems, matter-explained, home-network-for-smart-devices]
---

Smart devices talk using a handful of wireless technologies. You rarely choose one directly, but it decides whether a device needs a hub, how far it reaches, and how it survives an internet outage.

## Wi-Fi

Most budget plugs, bulbs and cameras use Wi-Fi because every home already has a router.

- **Pros:** no extra hub; fast enough for video; easy to set up.
- **Cons:** each device is a full Wi-Fi client, so dozens of them can strain a basic router. Battery devices drain quickly, which is why Wi-Fi door sensors are rare.
- **Band:** a large share of smart devices support only the **2.4 GHz** band. It travels further through walls than 5 GHz but is more crowded. This matters during pairing (see [connecting a device to Wi-Fi](/learn/connecting-a-device-to-wifi)).

## Bluetooth Low Energy

Used for pairing, nearby control, and some battery gadgets such as locks and sensors. Range is short, roughly one room to a few rooms, and control from outside the house needs a Wi-Fi hub or gateway to relay it.

## Zigbee

A low-power **mesh** protocol on 2.4 GHz.

- Needs a **hub or coordinator** (many smart speakers and bridges include one).
- Mains-powered devices such as plugs and bulbs usually **relay** messages for others, so the network gets stronger as you add them.
- Battery sensors can last a long time because they send tiny messages.
- Zigbee channels can overlap with Wi-Fi. If your sensors drop out, setting your router to channel 1, 6 or 11 and the Zigbee network to channel 15, 20 or 25 is a common way to reduce interference.

## Z-Wave

Similar idea to Zigbee, but it uses **sub-GHz radio**, so it avoids Wi-Fi congestion and penetrates walls well. Frequencies differ by region, so devices must match your country. It needs a Z-Wave hub. It is less common in budget products.

## Thread

A newer low-power, IP-based mesh used by Matter devices. A **Thread border router** connects the mesh to your home network. Some smart speakers, displays and streaming boxes act as border routers, so you may already own one. Check each product's specifications rather than assuming.

## Matter

Matter is not a radio. It is a common language that runs over Wi-Fi, Ethernet and Thread so devices from different brands can work in the same ecosystem. See [what Matter changes](/learn/matter-explained).

## Which one affects you?

| If you care about… | Look for |
| --- | --- |
| Least setup effort | Wi-Fi devices |
| Many battery sensors | Zigbee or Thread |
| Working during internet outages | Local control through a hub or Matter |
| Cameras and doorbells | Wi-Fi or wired Ethernet/PoE |

> **Note:** "Works with Alexa/Google" tells you about the *control layer*, not the radio. Read the box for both: how it connects, and what it works with. [Hubs and ecosystems](/learn/hubs-bridges-and-ecosystems) explains the second part.
