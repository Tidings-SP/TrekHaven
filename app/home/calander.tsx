"use client"

import * as React from "react"
import { addDays, format, isAfter, isBefore } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect } from "react"

export function CalendarForm({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  })
  const disabledDateRanges = [
    { start: new Date("2023-10-13"), end: new Date("2023-10-15") },
    { start: new Date("2023-10-20"), end: new Date("2023-10-25") },
  ];
  const isDisabled = (selected: any) => {
    if (!selected) {
      return false; // No selection, not disabled
    }
  
    for (const disabledRange of disabledDateRanges) {
      if (
        isBefore(selected.to, disabledRange.start) ||
        isAfter(selected.from, disabledRange.end)
      ) {
        continue; // No overlap, not disabled
      }
      return true; // Overlaps with a disabled range
    }
    return false; // No overlap with any disabled range
  };
  
  useEffect(() => {
    console.log(date)
  },[date])
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(selected) => {
              if (!isDisabled(selected)) {
                setDate(selected);
              }
            }}
            disabled={(d) =>
              d < addDays(new Date(), -1)
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
