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

const dayNamesEN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const dayNamesTR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/**
 * Bugünkü çalışma saatlerini döndürür
 */
export function getTodayWorkingHours(workingHoursJson?: string): string {
  if (!workingHoursJson) {
    return 'Çalışma saatleri belirtilmemiş';
  }

  try {
    const hours: WorkingHours = JSON.parse(workingHoursJson);
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayKey = dayNamesEN[today];
    const dayHours = hours[dayKey];

    if (!dayHours) {
      return 'Çalışma saatleri belirtilmemiş';
    }

    if (dayHours.closed) {
      return `Bugün (${dayNamesTR[today]}) Kapalı`;
    }

    return `${dayHours.open} - ${dayHours.close}`;
  } catch (e) {
    return 'Çalışma saatleri belirtilmemiş';
  }
}

/**
 * Tüm haftalık çalışma saatlerini döndürür
 */
export function getWeeklyWorkingHours(workingHoursJson?: string): Array<{ day: string; hours: string; isToday: boolean }> {
  if (!workingHoursJson) {
    return [];
  }

  try {
    const hours: WorkingHours = JSON.parse(workingHoursJson);
    const today = new Date().getDay();

    return dayNamesEN.map((dayKey, index) => {
      const dayHours = hours[dayKey];
      const hoursText = dayHours?.closed 
        ? 'Kapalı' 
        : dayHours 
        ? `${dayHours.open} - ${dayHours.close}`
        : '-';

      return {
        day: dayNamesTR[index],
        hours: hoursText,
        isToday: index === today,
      };
    });
  } catch (e) {
    return [];
  }
}

/**
 * Restoranın şu an açık olup olmadığını kontrol eder
 */
export function isRestaurantOpen(workingHoursJson?: string): boolean {
  if (!workingHoursJson) {
    return false;
  }

  try {
    const hours: WorkingHours = JSON.parse(workingHoursJson);
    const now = new Date();
    const today = now.getDay();
    const dayKey = dayNamesEN[today];
    const dayHours = hours[dayKey];

    if (!dayHours || dayHours.closed) {
      return false;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  } catch (e) {
    return false;
  }
}
