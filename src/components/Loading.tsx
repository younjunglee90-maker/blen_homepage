import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface LoadingProps {
  /** Optional message shown below the spinner */
  message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  const { t } = useTranslation();
  const resolvedMessage = message === 'Loading...' ? t('common.loading') : message;

  return (
    <div className="relative flex w-full min-h-screen items-center justify-center overflow-hidden bg-background py-24">
      {/* Background glow — matches NotFound */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

      {/* Subtle grid — matches NotFound */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:40px_40px]" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-10">
        {/* Background text */}
        <div className="relative flex items-center justify-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-[10rem] leading-none font-black tracking-tighter text-foreground/5 select-none md:text-[16rem]"
          >
            {t('common.appName')}
          </motion.h1>

          {/* Spinner + icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              {/* Outer slow ring */}
              <motion.span
                className="absolute h-24 w-24 rounded-full border-2 border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              />

              {/* Middle dashed ring */}
              <motion.span
                className="absolute h-16 w-16 rounded-full border-2 border-dashed border-primary/40"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              />

              {/* Inner spinning arc */}
              <motion.span
                className="absolute h-10 w-10 rounded-full border-2 border-transparent border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              />

              {/* Center logo dot */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4, ease: 'backOut' }}
                className="h-4 w-4 rounded-full bg-primary shadow-lg shadow-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <p className="text-base font-semibold tracking-wide text-foreground">{resolvedMessage}</p>

          {/* Animated dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
