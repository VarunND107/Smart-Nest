---
title: IR blasters and smart AC control
summary: How infrared remotes-in-an-app work, why AC state can drift out of sync, and when to use an IR controller instead of a smart plug.
order: 7
level: beginner
tags: [ir, ac, energy, automation, india]
deviceCategory: ir
related: [smart-plugs, energy-saving-automations, designing-automations-safely, device-offline-troubleshooting-flow]
---

Air conditioners, TVs, set-top boxes and fans with ordinary remotes all use **infrared (IR)** signals. An IR blaster (also called an IR hub or universal remote) is a small Wi-Fi device that learns or stores those signals and sends them when you ask through an app or a voice command.

This is often the most useful smart-home device in an Indian home, because it makes an existing split AC controllable without replacing it.

## What it can and cannot do

- **Can:** send the same commands as your remote: on, off, temperature, mode, fan speed.
- **Cannot:** *read* the AC's actual state. The blaster only transmits. If someone uses the physical remote, the app does not know.

That last point causes the most confusion. The app only remembers what *it* last sent, so it can show a mode or temperature that no longer matches the AC after someone used the physical remote. Most AC remotes send their full settings each time, so the next app command usually puts things right. TVs, fans and set-top boxes are different: many use a single **power-toggle** code, so an "off" sent while the device is already off turns it back **on**.

## Setup tips

1. Place the blaster **in line of sight** of the AC's receiver, within a few metres, with nothing in between. IR does not pass through walls.
2. Choose the exact AC brand and model in the app, or use the learning mode and point the original remote at the blaster.
3. Test every command from the app *and* from the original remote, then check that both give the expected result.
4. Add the AC to your voice assistant with a clear name such as "Bedroom AC".

## Smart plug vs IR for an AC

> **Safety:** Cutting an AC's power with a plug can shorten compressor life and may exceed a plug's rating. A typical 1.5-ton split AC draws several amps while running and more on start. Do not use a standard smart plug on an AC unless it is explicitly rated for it.

An IR controller sends the same safe "off" command as your remote and avoids both problems.

## Good automations

- Switch the AC off at a set time at night.
- Turn it on 15 minutes before you usually return, using a presence or schedule trigger.
- Set a fixed comfortable temperature at bedtime instead of cooling to the minimum.

See [energy-saving automations](/learn/energy-saving-automations) for ideas and how to check results. If the device keeps going offline, work through the [offline troubleshooting flow](/learn/device-offline-troubleshooting-flow).

## Newer ACs

Some air conditioners have built-in Wi-Fi and report their real state to an app. Those can be controlled more reliably than IR, but the app and updates come from the AC maker, so check support before relying on it.
