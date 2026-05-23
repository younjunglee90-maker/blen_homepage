import Section from '@/components/Section';
import { useTranslation } from 'react-i18next';

// ── Main hero ─────────────────────────────────────────────────────────────────
export default function Hero() {
    const { t } = useTranslation();
  return (
    <>
      {/* Hero section */}
      <Section
        id="hero"
        className="relative h-auto md:max-h-screen mx-auto flex pt-10 pb-20 items-center overflow-hidden bg-primary"
        
      >
        {/* Inner container */}
        <div className="relative z-5 mx-auto flex flex-col md:flex-row container flex-wrap items-center justify-between gap-0 bg-transparent">
          {/* ── LEFT ── */}
          <div className="flex-1 pt-5 md:pt-10 lg:pt-15">
            {/* Badge */}
            {/* <div className=" inline-flex items-center bg-[#FF6B9D33] gap-1.5 rounded-full px-6 py-2 text-[13px] font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-[#6B6B6B]">
              <img src="/heart.png" alt="Heart" className='w-6 h-6' />
            </div> */}

            {/* Headline */}
            <h1
              className="hero-headline mt-5 font-bold font-rationell leading-10 lg:leading-20 text-[#2D3436] text-[28px] lg:text-[64px]"
              
            >
            
             {t('heroContent.title1')}
              <br className=''/>
              <em className='font-rationell italic font-bold  text-[28px] lg:text-[64px] text-[#2D3436]'>
                {t('heroContent.title2')} 
              </em>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 font-rationell max-w-90 text-[16px] leading-relaxed"
               style={{ color: 'var(--text-primary)', opacity: 0.65 }}>
              {t('heroContent.description')}
            </p>

            {/* Store buttons */}
            <div className="mt-7 flex flex-wrap gap-3 flex-col lg:flex-row">
              {/* App Store */}
              <a
                href="#"
                className="inline-flex cursor-pointer items-center border justify-center gap-2.5  rounded-full text-base font-inter font-medium   bg-[#121212] text-white border-[#121212] px-5.5 py-3 text-[16px]  no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.2)] hover:text-white hover:bg-[#121212]">
                <img src="/apple.png" alt="App Store" />
                {t('common.appleStore')}
              </a>

              {/* Google Play */}
              <a
                href="#"
                className="inline-flex justify-center cursor-pointer items-center gap-2.5 text-base font-medium rounded-full font-inter border border-[#121212] bg-transparent px-5.5 text-[#121212]  py-3 text-[16px]  no-underline transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.2)] hover:text-white hover:bg-[#121212]">
                <img src="/google.png" alt="Google Play" />
                {t('common.googlePlay')}
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-6 flex items-center gap-2.5 ">
              {/* Avatar stack */}
              <div className="flex">
               <img src="image-group.png" alt="" />
              </div>
              <span className="text-[13px] font-semibold"
                    style={{ color: 'var(--text-primary)', opacity: 0.7 }}>
               {t('heroContent.socialProof')}
              </span>
            </div>
          </div>

          {/* ── RIGHT: mobile image placeholder ── */}
          <div className="relative mt-10 md:mt-0 md:flex min-w-65 flex-1 items-center justify-center ">
            {/* Add your mobile image here */}
            <div className="flex w-full items-center justify-center rounded-3x">
              <img src="/mobile-mockup.png" alt="" className='w-full'/>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
