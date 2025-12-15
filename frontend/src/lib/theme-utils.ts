// Tema ayarları için type tanımları
export interface ThemeSettings {
  preset?: 'light' | 'dark' | 'orange' | 'minimal';
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  headerBackgroundType?: 'gradient' | 'image' | 'solid';
  headerImageUrl?: string;
  showHeaderOverlay?: boolean;
  cardRadius?: 'sm' | 'md' | 'lg' | 'full';
  showProductImages?: boolean;
}

export interface CompleteTheme {
  preset: 'light' | 'dark' | 'orange' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headerBackgroundType: 'gradient' | 'image' | 'solid';
  headerImageUrl: string;
  showHeaderOverlay: boolean;
  cardRadius: 'sm' | 'md' | 'lg' | 'full';
  showProductImages: boolean;
}

// Preset tema tanımları
const THEME_PRESETS: Record<string, Partial<CompleteTheme>> = {
  light: {
    primaryColor: '#3B82F6', // Blue
    secondaryColor: '#8B5CF6', // Purple
    backgroundColor: '#F9FAFB', // Light gray
    headerBackgroundType: 'gradient',
    showHeaderOverlay: false,
    cardRadius: 'lg',
    showProductImages: true,
  },
  dark: {
    primaryColor: '#F97316', // Orange
    secondaryColor: '#EC4899', // Pink
    backgroundColor: '#0F172A', // Dark blue
    headerBackgroundType: 'gradient',
    showHeaderOverlay: true,
    cardRadius: 'lg',
    showProductImages: true,
  },
  orange: {
    primaryColor: '#F97316', // Orange
    secondaryColor: '#FB923C', // Light orange
    backgroundColor: '#FFF7ED', // Very light orange
    headerBackgroundType: 'solid',
    showHeaderOverlay: false,
    cardRadius: 'md',
    showProductImages: true,
  },
  minimal: {
    primaryColor: '#1F2937', // Dark gray
    secondaryColor: '#4B5563', // Medium gray
    backgroundColor: '#FFFFFF', // White
    headerBackgroundType: 'solid',
    showHeaderOverlay: false,
    cardRadius: 'sm',
    showProductImages: true, // Changed from false to true
  },
};

// Default tema ayarları (backward compatibility için)
const DEFAULT_THEME: CompleteTheme = {
  preset: 'light',
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  backgroundColor: '#F9FAFB',
  headerBackgroundType: 'gradient',
  headerImageUrl: '',
  showHeaderOverlay: false,
  cardRadius: 'lg',
  showProductImages: true,
};

/**
 * Tema ayarlarını parse eder ve tam bir tema objesi döndürür
 * @param themeSettings - JSON string veya object
 * @returns CompleteTheme objesi
 */
export function buildTheme(themeSettings?: string | ThemeSettings | null): CompleteTheme {
  // themeSettings yoksa default döndür
  if (!themeSettings) {
    return DEFAULT_THEME;
  }

  // String ise parse et
  let parsedSettings: ThemeSettings;
  try {
    parsedSettings = typeof themeSettings === 'string' 
      ? JSON.parse(themeSettings) 
      : themeSettings;
  } catch {
    return DEFAULT_THEME;
  }

  // Preset varsa preset ayarlarını al
  const presetSettings = parsedSettings.preset 
    ? THEME_PRESETS[parsedSettings.preset] 
    : {};

  // Merge: Default -> Preset -> Custom
  return {
    ...DEFAULT_THEME,
    ...presetSettings,
    ...parsedSettings,
    // Boş string'leri default değerle değiştir
    headerImageUrl: parsedSettings.headerImageUrl || DEFAULT_THEME.headerImageUrl,
  };
}

/**
 * Card radius için Tailwind class döndürür
 */
export function getCardRadiusClass(radius: CompleteTheme['cardRadius']): string {
  const radiusMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-2xl',
  };
  return radiusMap[radius] || radiusMap.lg;
}

/**
 * Header background CSS style objesi döndürür
 */
export function getHeaderBackgroundStyle(theme: CompleteTheme): React.CSSProperties {
  if (theme.headerBackgroundType === 'image' && theme.headerImageUrl) {
    return {
      backgroundImage: `url(${theme.headerImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  if (theme.headerBackgroundType === 'gradient') {
    return {
      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
    };
  }

  // solid
  return {
    backgroundColor: theme.primaryColor,
  };
}

/**
 * Preset listesi
 */
export const AVAILABLE_PRESETS = [
  { value: 'light', label: '☀️ Açık Tema', description: 'Modern ve aydınlık' },
  { value: 'dark', label: '🌙 Koyu Tema', description: 'Şık ve profesyonel' },
  { value: 'orange', label: '🧡 Turuncu Tema', description: 'Sıcak ve davetkar' },
  { value: 'minimal', label: '⚪ Minimal Tema', description: 'Sade ve zarif' },
];
