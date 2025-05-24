[![](https://dcbadge.vercel.app/api/server/3E8ca2dkcC)](https://discord.gg/3E8ca2dkcC)

# Bitaxe Web Flasher

The Bitaxe Web Flasher is the open source tool that provides you an easy solution to flash a factory file to your device.

## Flashing process

Simply connect your device, select the model and board version and click on flash.

## Development / Run locally

You can use Docker for compiling the application and to run it locally by

```bash
# build the image
docker build . -f Dockerfile -t bitaxe-web-flasher

# run the container
docker run --rm -d -p 3000:3000 bitaxe-web-flasher
```

and access it by `http://localhost:3000`
