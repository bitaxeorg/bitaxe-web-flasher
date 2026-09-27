import { useState } from 'react'
import { basePath, cn } from '@/lib/utils'

export type DeviceInfo = {
  name: string;
  family?: string;
  asic?: string;
  asic_count?: number;
  image?: string;
}

export type FamilyInfo = {
  name: string;
  image?: string;
}

function asicLabel(device: DeviceInfo) {
  if (!device.asic) return ''
  return device.asic_count && device.asic_count > 1 ? `${device.asic} × ${device.asic_count}` : device.asic
}

// Literal class names so Tailwind keeps them; avoids an empty slot when there are fewer than 4 cards
const topRowColumns = ['sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4']

const cardClass = (isSelected: boolean) => cn(
  "rounded-lg border bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  isSelected
    ? "border-primary ring-1 ring-primary bg-accent"
    : "border-input text-muted-foreground"
)

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>
  )
}

type DeviceGridProps = {
  devices: DeviceInfo[];
  families: FamilyInfo[];
  selected: string;
  // Called with '' when a family with several models is opened and no model is chosen yet
  onSelect: (name: string) => void;
  disabled?: boolean;
  labels: {
    selectDevice: string;
    selectModel: string;
    models: (count: number) => string;
  };
}

export default function DeviceGrid({ devices, families, selected, onSelect, disabled, labels }: DeviceGridProps) {
  // Devices sharing a family collapse into one card; the rest stand on their own
  const groupKey = (d: DeviceInfo) => d.family ?? d.name
  const groups = Array.from(new Set(devices.map(groupKey))).map(key => ({
    key,
    family: families.find(f => f.name === key),
    members: devices.filter(d => groupKey(d) === key),
  }))

  const selectedDevice = devices.find(d => d.name === selected)
  const [openGroup, setOpenGroup] = useState(selectedDevice ? groupKey(selectedDevice) : '')
  const activeGroup = groups.find(g => g.key === openGroup)

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-2">
        <SectionLabel>{labels.selectDevice}</SectionLabel>
        <div className={cn("grid grid-cols-2 gap-2", topRowColumns[Math.min(groups.length, 4) - 1])}>
          {groups.map(group => {
            const single = group.members.length === 1 ? group.members[0] : undefined
            const image = group.family?.image ?? single?.image
            return (
              <button
                key={group.key}
                type="button"
                aria-pressed={group.key === openGroup}
                disabled={disabled}
                onClick={() => {
                  setOpenGroup(group.key)
                  onSelect(single ? single.name : '')
                }}
                className={cn(cardClass(group.key === openGroup), "flex flex-col items-center justify-center gap-2 p-3 text-center")}
              >
                {image && (
                  <span className="flex h-24 w-full items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${basePath}/${image}`} alt="" className="h-full w-auto object-contain" />
                  </span>
                )}
                <span className="w-full min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{group.key}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {single ? asicLabel(single) : labels.models(group.members.length)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {activeGroup && activeGroup.members.length > 1 && (
        <div className="space-y-2">
          <SectionLabel>{labels.selectModel}</SectionLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {activeGroup.members.map(device => (
              <button
                key={device.name}
                type="button"
                aria-pressed={device.name === selected}
                disabled={disabled}
                onClick={() => onSelect(device.name)}
                className={cn(cardClass(device.name === selected), "p-3 text-left")}
              >
                <span className="block truncate text-sm font-medium text-foreground">{device.name}</span>
                {device.asic && (
                  <span className="block truncate text-xs text-muted-foreground">{asicLabel(device)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

type BoardPickerProps = {
  boards: string[];
  selected: string;
  onSelect: (name: string) => void;
  disabled?: boolean;
  label: string;
}

export function BoardPicker({ boards, selected, onSelect, disabled, label }: BoardPickerProps) {
  return (
    <div className="space-y-2 text-left">
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {boards.map(board => (
          <button
            key={board}
            type="button"
            aria-pressed={board === selected}
            disabled={disabled}
            onClick={() => onSelect(board)}
            className={cn(
              "h-9 min-w-[3.5rem] rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              board === selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent"
            )}
          >
            {board}
          </button>
        ))}
      </div>
    </div>
  )
}
