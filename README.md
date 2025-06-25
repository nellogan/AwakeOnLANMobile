# AwakeOnLANMobile

[![CI](https://github.com/nellogan/AwakeOnLANMobile/actions/workflows/CI.yml/badge.svg)](https://github.com/nellogan/AwakeOnLANMobile/actions/workflows/CI.yml)
[![CD](https://github.com/nellogan/AwakeOnLANMobile/actions/workflows/CD.yml/badge.svg)](https://github.com/nellogan/AwakeOnLANMobile/actions/workflows/CD.yml)
[![Release Version](https://img.shields.io/github/v/release/nellogan/awakeonlanmobile?sort=semver)](https://github.com/nellogan/AwakeOnLANMobile/releases)

[![Android](https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white)](#)
[![React Native](https://img.shields.io/badge/React_Native-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)
[![C++](https://img.shields.io/badge/C++-%2300599C.svg?logo=c%2B%2B&logoColor=white)](#)

## Overview

AwakeOnLANMobile enables you to send Wake On LAN ([WOL](https://en.wikipedia.org/wiki/Wake-on-LAN)) packets, allowing you to remotely wake up your devices over either a local area network (LAN) or over the internet. It supports IPv4 and IPv6 addresses. The application offers several features:

### Features

- **Open Source**: Licensed under GPLv3 License with zero advertisements and no account creation necessary.
- **Local Storage**: Add, edit, or delete device information for easy access.
- **Network Scanning**: Discover devices on your LAN or over the internet using either an IPv4 address or CIDR notation for subnets (e.g., 192.168.1.1 or 192.168.1.1/24). Choose between PING and TCP connect (sent to Port 443) packets for scanning. PING will require 1 second per IP address, while TCP connect will be faster. TCP Connect is similar to nmap's stealth scan but not as stealthy. This tool is useful for checking if the Wake On LAN packet was successful. Scanning only supports IPv4 addresses. NOTE: Some network cards may take up to a few minutes to respond after system boot.
- **Theme Toggle**: Switch between a light and dark mode theme to customize the appearance based on your preferences. The selected theme will be persisted even after shutting down the application.

Developed with React Native (Typescript) and utilizes C++ turbo modules for native level socket access when sending and receiving packets. The ./cpp directory contains lightly modified code from:

- [AwakeOnLAN](https://github.com/nellogan/awakeonlan)
- [NetScan](https://github.com/nellogan/netscan)

These are Linux commandline utilities that can be used in lieu of this application if your device supports a terminal, such as Termux or the new Android AVF Linux terminal. The file naming scheme differs for NativeModule.cpp and NativeModule.h as this scheme is needed to support React Native's turbo C++ bridging. The other C++ code kept its original file naming scheme since they are from pre-existing repositories.

## Demo Video

[awakeonlanmobile_demo.webm](https://github.com/user-attachments/assets/04d7949e-2e7e-445c-bb2a-33e31e8d2d00)

## Prerequisites

NOTE: You can directly install the release .apk file if downloaded and opened with an android device. You can skip the prerequisites below.

- Properly installed Android Studio: Ensure that you have Android Studio set up correctly on your development machine. This is required for building, testing, and deploying AwakeOnLANMobile to an Android device.
- Device capable of installing packages from Android Studio: Make sure your Android device supports installing applications directly from Android Studio. If your device has developer options enabled, you can enable USB debugging to allow your computer to install apps on it through a USB connection.

## Installation

### Install release .apk file directly on android device

1. Download the appropriate architecture .apk file from the latest release from this link: [Releases](https://github.com/nellogan/AwakeOnLANMobile/releases)
2. Tap the .apk file and follow the prompts

### Install release .apk file to your computer then use adb to install on android device

1. Download the appropriate architecture .apk file
2. Substitute for appropriate abi and architecture: `adb install awakeonlanmobile-${abi}-${variant.versionName}.apk`

### Build from source and install:

1. Clone this repository: `git clone https://github.com/nellogan/awakeonlanmobile.git`
2. Navigate into the project directory: `cd awakeonlanmobile`
3. Install dependencies: `npm install` or `yarn install`

#### For a development build:

4. Start the Metro Bundler: `npx react-native start` or `yarn react-native start`
5. Open another terminal and run: `npx react-native run-android` or `yarn react-native run-android`

#### For a release build (NOTE: .apk files must be signed even if directly installed with `adb install`):

5. Create a keystore: `keytool -genkey -v -keystore /full/path/to/keystorename.keystore -alias alias -keyalg RSA -keysize 4096 -validity 10000`
6. Source the environment variables:

   `source <(echo "export RELEASE_STORE_FILE=/full/path/to/keystorename.keystore"; echo "export RELEASE_STORE_PASSWORD=password"; echo "export RELEASE_KEY_ALIAS=alias"; echo "export RELEASE_KEY_PASSWORD=password")`

7. Build: `npx react-native build-android --mode=release` or `yarn react-native build-android --mode=release`
8. Assemble .apk files: `cd android && ./gradlew assembleRelease`
9. Install the appropriate .apk file: `adb install app/build/outputs/apk/release/awakeonlanmobile-${abi}-${variant.versionName}.apk`

## License

This project is licensed under the [GPLv3 License](./LICENSE).

## Future Development

- The application is intended to be uploaded to F-Droid in the future.
- Considering adding iOS support in the future.
- Stay tuned for updates!
