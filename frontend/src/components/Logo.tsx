import { cn } from '@/lib/utils';

interface LogoProps {
  /**
   * Logo variant - use 'white' for dark backgrounds
   */
  variant?: 'default' | 'white';

  /**
   * Size preset or custom className
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional className for custom styling
   */
  className?: string;

  /**
   * Whether to show the text alongside logo
   */
  showText?: boolean;

  /**
   * Custom text to display (defaults to "Gabay Barangay")
   */
  text?: string;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24'
};

export function Logo({
  variant = 'default',
  size = 'md',
  className,
  showText = false,
  text = 'Gabay Barangay'
}: LogoProps) {
  // Use PNG logo (user's actual logo file)
  const logoSrc = variant === 'white'
    ? '/theycare-white.png'
    : '/theycare.png';

  // Fallback to text if image doesn't exist
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const textEl = e.currentTarget.nextElementSibling as HTMLElement;
    if (textEl) textEl.style.display = 'block';
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={logoSrc}
        alt="Gabay Barangay Logo"
        className={cn(sizeClasses[size], 'w-auto object-contain')}
        onError={handleImageError}
      />

      {/* Fallback text logo */}
      <div
        className={cn(
          'font-bold text-primary hidden',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl',
          size === 'xl' && 'text-4xl'
        )}
      >
        Gabay Barangay
      </div>

      {showText && (
        <span className={cn(
          'font-semibold text-foreground',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl'
        )}>
          {text}
        </span>
      )}
    </div>
  );
}

// Preset logo variations
export function LogoWithText(props: Omit<LogoProps, 'showText'>) {
  return <Logo {...props} showText />;
}

export function LogoSmall(props: Omit<LogoProps, 'size'>) {
  return <Logo {...props} size="sm" />;
}

export function LogoLarge(props: Omit<LogoProps, 'size'>) {
  return <Logo {...props} size="lg" />;
}

export function LogoWhite(props: Omit<LogoProps, 'variant'>) {
  return <Logo {...props} variant="white" />;
}
