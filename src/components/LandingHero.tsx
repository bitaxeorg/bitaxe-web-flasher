'use client'

import { useState, useEffect, useRef } from 'react'
import { ComputerIcon, Download, Usb, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { ESPLoader, Transport } from 'esptool-js'
import { useTranslation } from 'react-i18next'
import Header from './Header'
import InstructionPanel from './InstructionPanel'
import Selector from './Selector'
import device_data from './firmware_data.json'

import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

export default function LandingHero() {
  const { t } = useTranslation();
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [selectedBoardVersion, setSelectedBoardVersion] = useState('')
  const [selectedFirmware, setSelectedFirmware] = useState('')
  const [status, setStatus] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isChromiumBased, setIsChromiumBased] = useState(true)
  const serialPortRef = useRef<any>(null)
  const terminalRef = useRef<Terminal | null>(null)
  const terminalContainerRef = useRef<HTMLDivElement>(null)
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null)
  const textDecoderRef = useRef<TextDecoderStream | null>(null)
  const readableStreamClosedRef = useRef<Promise<void> | null>(null)
  const logsRef = useRef<string>('')
  const [keepConfig, setKeepConfig] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChromium = /chrome|chromium|crios|edge/i.test(userAgent);
    setIsChromiumBased(isChromium);
  }, []);

  useEffect(() => {
    if (terminalContainerRef.current && !terminalRef.current && isLogging) {
      const term = new Terminal({
        cols: 80,
        rows: 24,
        theme: {
          background: '#1a1b26',
          foreground: '#a9b1d6'
        }
      });
      terminalRef.current = term;
      term.open(terminalContainerRef.current);
      term.writeln(t('status.loggingStarted'));
      logsRef.current = t('status.loggingStarted') + '\n';
    }

    return () => {
      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
      }
    };
  }, [isLogging, t]);

  const devices = device_data.devices;
  const device = selectedDevice !== ''
    ? devices.find(d => d.name == selectedDevice)!
    : { boards: [] };
  const board = selectedBoardVersion !== ''
    ? device.boards.find(b => b.name == selectedBoardVersion)!
    : { supported_firmware: [] };
  const firmware = selectedFirmware !== ''
    ? board.supported_firmware.find(f => f.version == selectedFirmware)!
    : { path: '' };

  const handleConnect = async () => {
    setIsConnecting(true)
    setStatus(t('status.connecting'))

    try {
      const port = await navigator.serial.requestPort()
      await port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      })

      serialPortRef.current = port
      setIsConnected(true)
      setStatus(t('status.connected'))
    } catch (error) {
      console.error('Connection failed:', error)
      setStatus(`${t('status.connectionFailed')}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (isLogging) {
      await stopSerialLogging();
    }
    try {
      if (serialPortRef.current?.readable) {
        await serialPortRef.current.close();
      }
      serialPortRef.current = null;
      setIsConnected(false)
      setStatus("")
    } catch (error) {
      console.error('Disconnect error:', error);
      setStatus(`${t('status.disconnectError')}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const handleKeepConfigToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeepConfig(event.target.checked);
  };

  const startSerialLogging = async () => {
    if (!serialPortRef.current) {
      setStatus(t('status.connectFirst'));
      return;
    }

    try {
      setIsLogging(true);
      const port = serialPortRef.current;

      // First ensure any existing connections are cleaned up
      if (readerRef.current) {
        await readerRef.current.cancel();
      }
      if (readableStreamClosedRef.current) {
        await readableStreamClosedRef.current;
      }

      // Set up text decoder stream
      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();

      textDecoderRef.current = decoder;
      readableStreamClosedRef.current = inputDone;
      readerRef.current = reader;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            reader.releaseLock();
            break;
          }
          terminalRef.current?.write(value);
          logsRef.current += value;
        }
      } catch (error) {
        console.error('Error in read loop:', error);
      }
    } catch (error) {
      console.error('Serial logging error:', error);
      setStatus(`${t('status.loggingError')}: ${error instanceof Error ? error.message : String(error)}`);
    }
    setIsLogging(false);
  };

  const stopSerialLogging = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (readableStreamClosedRef.current) {
        await readableStreamClosedRef.current;
        readableStreamClosedRef.current = null;
      }
      if (textDecoderRef.current) {
        textDecoderRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping serial logging:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const downloadLogs = () => {
    const blob = new Blob([logsRef.current], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `bitaxe-logs-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleStartFlashing = async () => {
    if (!serialPortRef.current) {
      setStatus(t('status.connectFirst'))
      return
    }

    if (!selectedDevice || !selectedBoardVersion) {
      setStatus(t('status.selectBoth'))
      return
    }
    
    if (!selectedFirmware) {
      setStatus(t('status.selectBoth'))
      return
    }

    setIsFlashing(true)
    setStatus(t('status.preparing'))

    try {
      // Stop logging if it's active
      if (isLogging) {
        await stopSerialLogging();
      }

      // Close the current connection
      if (serialPortRef.current.readable) {
        await serialPortRef.current.close();
      }

      // Create transport and ESPLoader for flashing
      const transport = new Transport(serialPortRef.current);
      const loader = new ESPLoader({
        transport,
        baudrate: 115200,
        romBaudrate: 115200,
        terminal: {
          clean() { },
          writeLine(data: string) {
            // setStatus(data);
          },
          write(data: string) {
            // setStatus(data);
          },
        },
      });

      await loader.main();

      if (!firmware) {
        throw new Error('No firmware available for the selected device and board version')
      }

      const firmwareResponse = await fetch(firmware.path)
      if (!firmwareResponse.ok) {
        throw new Error('Failed to load firmware file')
      }

      const firmwareArrayBuffer = await firmwareResponse.arrayBuffer()
      const firmwareUint8Array = new Uint8Array(firmwareArrayBuffer)
      const firmwareBinaryString = Array.from(firmwareUint8Array, (byte) => String.fromCharCode(byte)).join('')

      setStatus(t('status.flashing', { percent: 0 }))

      // On all Bitaxe derivatives the same
      const nvsStart = 0x9000;
      const nvsSize = 0x6000;

      let parts;

      if (keepConfig) {
        parts = [
          {
            data: firmwareBinaryString.slice(0, nvsStart), // Data before NVS
            address: 0,
          },
          {
            data: firmwareBinaryString.slice(nvsStart + nvsSize), // Data after NVS
            address: nvsStart + nvsSize,
          },
        ];
      } else {
        parts = [
          {
            data: firmwareBinaryString, // Entire firmware binary
            address: 0,
          },
        ];
      }

      await loader.writeFlash({
        fileArray: parts,
        flashSize: "keep",
        flashMode: "keep",
        flashFreq: "keep",
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const percent = Math.round((written / total) * 100)
          if (percent == 100) {
            setStatus(t('status.completed'))
          } else {
            setStatus(t('status.flashing', { percent: percent }))
          }
        },
        calculateMD5Hash: () => '',
      })

      setStatus(t('status.completed'))
      
      // Hard reset the device
      await loader.hardReset()
      
      // Disconnect the transport to release the serial port
      await transport.disconnect()
      
      // Close the serial port to complete the disconnection
      if (serialPortRef.current?.readable) {
        await serialPortRef.current.close()
      }
      
      // Clear the serial port reference and update connection state
      serialPortRef.current = null
      setIsConnected(false)
      
      setStatus(t('status.success'))
    } catch (error) {
      console.error('Flashing failed:', error)
      setStatus(`${t('status.flashingFailed')}: ${error instanceof Error ? error.message : String(error)}. Please try again.`)
    } finally {
      setIsFlashing(false)
    }
  }

  if (!isChromiumBased) {
    return (
      <div className="container px-4 md:px-6 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none mb-4">
          {t('errors.browserCompatibility.title')}
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          {t('errors.browserCompatibility.description')}
        </p>
      </div>
    )
  }

  return (
    <>
      <Header onOpenPanel={() => setIsPanelOpen(true)} />
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                {t('hero.title')}
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                {t('hero.description')}
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Button
                className="w-full"
                onClick={isConnected ? handleDisconnect : handleConnect}
                disabled={isConnecting || isFlashing}
              >
                {isConnected ? t('hero.disconnect') : t('hero.connect')}
                <Usb className="ml-2 h-4 w-4" />
              </Button>
              <Selector
                placeholder={t('hero.selectDevice')}
                values={devices.map(d => d.name)}
                onValueChange={(value) => {
                  setSelectedDevice(value)
                  setSelectedBoardVersion('')
                  setSelectedFirmware('')
                }}
                disabled={isConnecting || isFlashing || !isConnected}
              />
              {selectedDevice && (
                <Selector
                  placeholder={t('hero.selectBoard')}
                  values={device.boards.map(b => b.name)}
                  onValueChange={(value) => {
                    setSelectedBoardVersion(value)
                    setSelectedFirmware('')
                  }}
                  disabled={isConnecting || isFlashing}
                />
              )}
              {selectedBoardVersion && (
                <Selector
                  placeholder={t('hero.selectFirmware')}
                  values={board.supported_firmware.map(f => f.version)}
                  onValueChange={setSelectedFirmware}
                  disabled={isConnecting || isFlashing}
                />
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="keepConfig"
                  className="cursor-pointer"
                  checked={keepConfig}
                  onChange={handleKeepConfigToggle}
                />
                <label htmlFor="keepConfig" className="text-gray-500 dark:text-gray-400 cursor-pointer">
                  {t('hero.keepConfig')}
                </label>
              </div>
              <Button
                className="w-full"
                onClick={handleStartFlashing}
                disabled={!selectedDevice || !selectedBoardVersion || !selectedFirmware || isConnecting || isFlashing || !isConnected}
              >
                {isFlashing ? t('hero.flashing') : t('hero.startFlashing')}
                <Zap className="ml-2 h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={isLogging ? stopSerialLogging : startSerialLogging}
                  disabled={!isConnected || isFlashing}
                >
                  {isLogging ? t('hero.stopLogging') : t('hero.startLogging')}
                  <ComputerIcon className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  className="flex-1"
                  onClick={downloadLogs}
                  disabled={!logsRef.current}
                >
                  {t('hero.downloadLogs')}
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="mx-auto max-w-[400px] text-gray-500 md:text-m dark:text-gray-400">
                {t('hero.loggingDescription')}
              </p>
              {status && <p className="mt-2 text-sm font-medium">{status}</p>}
            </div>
            {isLogging && (
              <div
                ref={terminalContainerRef}
                className="w-full max-w-4xl h-[400px] bg-black rounded-lg overflow-hidden mt-8 border border-gray-700 text-left"
              />
            )}
          </div>
        </div>
      </section>
      <InstructionPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </>
  )
}
