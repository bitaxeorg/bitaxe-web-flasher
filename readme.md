<div align="center">

# Bitaxe Web Flasher

**Flash your Bitaxe directly from the browser. No drivers, no CLI, no setup.**

The Bitaxe Web Flasher is the open source tool that provides you an easy solution to flash a factory file to your device.

[![Discord](https://dcbadge.limes.pink/api/server/3E8ca2dkcC)](https://discord.gg/3E8ca2dkcC)

[![License](https://img.shields.io/github/license/bitaxeorg/bitaxe-web-flasher)](LICENSE)
[![Release](https://img.shields.io/github/v/release/bitaxeorg/bitaxe-web-flasher)](https://github.com/bitaxeorg/bitaxe-web-flasher/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Deployed on GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://bitaxeorg.github.io/bitaxe-web-flasher/)

### [Open the flasher →](https://bitaxeorg.github.io/bitaxe-web-flasher/)

</div>

---

## Requirements

The flasher talks to your device with the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API), which is only available in Chromium-based browsers.

| | |
| --- | --- |
| **Supported** | Google Chrome, Microsoft Edge, Brave, Opera |
| **Not supported** | Firefox, Safari |

A USB cable that carries data (not charge-only) is also required.

## Flashing process

Simply connect your device, select the model and board version and click on flash.

### How to use

1. Connect your Bitaxe to your computer.
2. Click "Connect Device" and select your device from the popup.
3. Select your device model from the dropdown.
4. Choose the appropriate board version.
5. Click "Start Flashing" to begin the process.
6. Wait for the flashing process to complete.
7. Disconnect and reset your device.

Firmware versions are pulled live from the GitHub releases of the matching firmware repository, with drafts and pre-releases filtered out, so the list always reflects current stable builds.

Tick **Keep configuration** before flashing to preserve your existing settings, such as pool and WiFi credentials, instead of returning the device to defaults.

## Supported devices

| Device | Board versions | Firmware |
| --- | --- | --- |
| Max | 102 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| Ultra | 201, 202, 203, 204, 205, 207 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| UltraHex | 302, 303 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| Supra | 401, 402, 403 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| Gamma | 601, 602 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| Gamma Duo | 650 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| Gamma Turbo | 801 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| SupraHex | 701, 702 | [ESP-Miner](https://github.com/bitaxeorg/ESP-Miner) |
| NerdMiner | 100 | — |
| NerdNOS | 100 | — |
| Bitforge Nano | 800 | — |

The device and board list is defined in [`src/components/firmware_data.json`](src/components/firmware_data.json).

## Features

- **Web based** — no need for special software, use your web browser.
- **Fast flashing** — flash your Bitaxe in seconds, not minutes.
- **Multiple boards** — support for various Bitaxe boards and modules.
- **Keep configuration** — optionally preserve existing device settings across a flash.
- **Serial logging** — connect your device, log the serial data and download it later on.
- **Light and dark theme.**
- **Nine languages** — English, Deutsch, Italiano, Português, Русский, Türkçe, Slovenský, Română and Klingon.

## Documentation

For more detailed instructions, please refer to the [OSMU wiki](https://www.osmu.wiki).

## Development / Run locally

You can use Docker for compiling the application and to run it locally by

```bash
# build the image
docker build . -f Dockerfile -t bitaxe-web-flasher

# run the container
docker run --rm -d -p 3000:3000 bitaxe-web-flasher
```

and access it by `http://localhost:3000`

### Without Docker

```bash
npm install
npm run dev
```

The dev server also runs on `http://localhost:3000`.

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Produce a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run the Next.js linter. |

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14, React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS, Radix UI |
| Flashing | [esptool-js](https://github.com/espressif/esptool-js), Web Serial API |
| Serial console | [xterm.js](https://xtermjs.org/) |
| Localisation | i18next, react-i18next |
| Hosting | GitHub Pages |

## Deployment

Pushes to `main` are built and published to GitHub Pages by [`.github/workflows/nextjs.yml`](.github/workflows/nextjs.yml).

## Contributing

Issues and pull requests are welcome.

Adding support for a new board usually means adding an entry to [`src/components/firmware_data.json`](src/components/firmware_data.json). Translations live in [`src/i18n/locales/`](src/i18n/locales/) — copy `en.json`, translate the values, and register the locale in [`src/i18n/config.ts`](src/i18n/config.ts) and the language list in [`src/components/LanguageSelector.tsx`](src/components/LanguageSelector.tsx).

## Community

Join the [Open Source Miners United Discord](https://discord.gg/3E8ca2dkcC).

## License

Released under the [GNU General Public License v3.0](LICENSE).

Built by [WantClue](https://wantclue.de).
