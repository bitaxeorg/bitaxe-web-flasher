#!/bin/bash

if [ ! -d "$ESP_MINER_PATH" ]; then
    echo "ESP_MINER_PATH not found: $ESP_MINER_PATH"
    exit 1
fi

board=""
idf_version="v5.4"
flash_only=0
tag="dev"

function show_help() {
    echo "Usage: build-images.sh [OPTIONS]"
    echo "Options:"
    echo "  -b board: Build only board image. example: 601"
    echo "  -e: espressif/idf version. default: $idf_version"
    echo "  -f: Only launch the web flasher"
    echo "  -t tag: Add tag to image name esp-miner-factory-<board>-<tag>.bin. default: $tag"
}

if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

while getopts "b:e:ft:" opt; do
    case "$opt" in
        f)
            flash_only=1
            ;;
        b)  board=$OPTARG
            ;;
        e)  idf_version=$OPTARG
            ;;
        t)  tag=$OPTARG
            ;;
     esac
done

if [ $flash_only -eq 0 ]; then
    echo "Building esp-miner-factory with idf version $idf_version"
    docker build -t esp-miner-factory \
        --build-arg IDF_VERSION=$idf_version \
        -f image-factory/Dockerfile-expressif .
    
    docker run --rm -v $ESP_MINER_PATH:/project -w /project esp-miner-factory idf.py build
    if [ $? -ne 0 ]; then
        echo "IDF build failed, check the logs for more information"
        exit 1
    fi

    if [ -z "$board" ]; then
        boards="102 201 202 203 204 205 401 402 403 601"
    else
        boards=$board
    fi

    for board in $boards; do
        if [ -f "$ESP_MINER_PATH/config-$board.cvs" ]; then
            # Build config.bin for $board
            docker run --rm -w /project -v $ESP_MINER_PATH:/project esp-miner-factory \
                /opt/esp/idf/components/nvs_flash/nvs_partition_generator/nvs_partition_gen.py \
                generate config-${board}.cvs config.bin 0x6000

            bin_file="esp-miner-factory-${board}-${tag}.bin"

            # Creating image for board $board to public/firmware
            docker run --rm -w /project -v $ESP_MINER_PATH:/project \
                -v $PWD/image-factory:/firmware \
                 esp-miner-factory \
                /project/merge_bin.sh -c /firmware/$bin_file

            # Tell webflasher about our local firmware
            name=""
            case "$board" in
                "102")
                    name="Max"
                    ;;
                "201"|"202"|"203"|"204"|"205")
                    name="Ultra"
                    ;;
                "401"|"402"|"403")
                    name="Supra"
                    ;;
                "601")
                    name="Gamma"
                    ;;
            esac
            echo "Found board: $board"
            if [ -n "$name" ]; then
                echo "$name,$board,$tag,firmware_local/$bin_file" >> image-factory/firmware_data.csv
                echo "name: $name"
            fi
        fi   
    done
fi

# Remove duplicates from firmware_data.csv
sort -u image-factory/firmware_data.csv -o image-factory/firmware_data.csv

# Build webflasher image
docker build -t bitaxe-web-flasher .

Open web browser to the local webflasher
if command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "http://localhost:3000"
elif command -v open >/dev/null 2>&1; then
    # macOS
    open "http://localhost:3000"
elif command -v start >/dev/null 2>&1; then
    # Windows
    start "http://localhost:3000"
fi

# Use start the web flasher with the dev firmware in the build-docker directory
docker run --rm --name bwf \
    -v $PWD/image-factory:/app/out/firmware_local \
    -p 3000:3000 bitaxe-web-flasher
