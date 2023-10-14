import React, { useEffect, useRef, useState } from 'react';
import { DateRange } from 'react-date-range';
import format from 'date-fns/format';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

export default function CalendarForm() {
  // date state
  const [range, setRange] = useState<any>([ // Use Range[] here
    {
      startDate: addDays(new Date(), 1),
      endDate: addDays(new Date(), 4),
      key: 'selection'
    }
  ]);

  function generateDateList (startDate: Date, endDate: Date) {
    const dateList = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dateList.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    setDateList(dateList); // Set the generated date list in state
  };
  const [dateList, setDateList] = useState<Date[]>([]);
  useEffect(()=>{
    generateDateList(range[0].startDate, range[0].endDate);
    
  },[range])
  

  // open close
  const [open, setOpen] = useState(false);

  // get the target element to toggle
  const refOne = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // event listeners
    document.addEventListener('keydown', hideOnEscape, true);
    document.addEventListener('click', hideOnClickOutside, true);
    
    return () => {
      document.removeEventListener('keydown', hideOnEscape, true);
      document.removeEventListener('click', hideOnClickOutside, true);
    };
  }, []);

  // hide dropdown on ESC press
  const hideOnEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Hide on outside click
  const hideOnClickOutside = (e: MouseEvent) => {
    if (refOne.current && !refOne.current.contains(e.target as Node)) {
      
      setOpen(false);
    }
  };

  const handleDateChange = (newRange:any) => {
    const newStartDate = newRange[0].startDate;
    if (newStartDate > addDays(new Date(), -1)) {
      setRange(newRange);
    }
  };

  return (
    <div >
      <input
        value={`${format(range[0].startDate, "MM/dd/yyyy")} to ${format(range[0].endDate, "MM/dd/yyyy")}`}
        readOnly
        className="inputBox"
        onClick={() => setOpen(open => !open)}
      />

      <div ref={refOne}>
        {open && 
          <DateRange
         
            onChange={item => handleDateChange([item.selection])}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={range}
            months={2}
            disabledDates={[]}
            direction="horizontal"
            className="calendarElement"
          />
        }
      </div>
    </div>
  );
}
