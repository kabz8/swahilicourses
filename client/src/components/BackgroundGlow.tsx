import clsx from 'clsx';

interface BackgroundGlowProps {
  className?: string;
}

export function BackgroundGlow({ className }: BackgroundGlowProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden',
        className,
      )}
    >
      <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-blob" />
      <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_60%)]" />
    </div>
  );
}

