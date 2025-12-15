'use client';

import { useState, useEffect } from 'react';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

const defaultDayHours: DayHours = {
  open: '09:00',
  close: '23:00',
  closed: false,
};

const dayNames = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

interface Props {
  value?: string; // JSON string or empty
  onChange: (value: string) => void;
}

export default function WorkingHoursEditor({ value, onChange }: Props) {
  const [hours, setHours] = useState<WorkingHours>({
    monday: { ...defaultDayHours },
    tuesday: { ...defaultDayHours },
    wednesday: { ...defaultDayHours },
    thursday: { ...defaultDayHours },
    friday: { ...defaultDayHours },
    saturday: { ...defaultDayHours },
    sunday: { ...defaultDayHours },
  });

  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        setHours(parsed);
      } catch (e) {
        console.error('Invalid working hours JSON:', e);
      }
    }
  }, [value]);

  const updateDay = (day: keyof WorkingHours, field: keyof DayHours, val: any) => {
    const updated = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: val,
      },
    };
    setHours(updated);
    onChange(JSON.stringify(updated));
  };

  return (
    <div className="space-y-3">
      {(Object.keys(dayNames) as Array<keyof WorkingHours>).map((day) => (
        <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="w-32 font-medium text-gray-700">{dayNames[day]}</div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hours[day].closed}
              onChange={(e) => updateDay(day, 'closed', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-600">Kapalı</span>
          </label>

          {!hours[day].closed && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Açılış:</label>
                <input
                  type="time"
                  value={hours[day].open}
                  onChange={(e) => updateDay(day, 'open', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Kapanış:</label>
                <input
                  type="time"
                  value={hours[day].close}
                  onChange={(e) => updateDay(day, 'close', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
