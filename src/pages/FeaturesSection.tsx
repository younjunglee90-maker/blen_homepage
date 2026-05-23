import Section from '@/components/Section';
import { Heart, MessageCircle, Sparkles, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FeaturesSection() {
  const { t , i18n} = useTranslation();
  console.log(i18n.language)
  const cards = [
    {
      icon: <UserCheck size={18} strokeWidth={2} fill="" />,
      title: t('feature.box1.title'),
      desc: t('feature.box1.description'),
    },
    {
      icon: <MessageCircle size={18} strokeWidth={2} fill="" />,
      title: t('feature.box2.title'),
      desc: t('feature.box2.description'),
    },
    {
      icon: <Sparkles size={18} strokeWidth={2} />,
      title: t('feature.box3.title'),
      desc: t('feature.box3.description'),
    },
  ];
  return (
    <Section id="features" className="font-inter flex w-full items-center justify-center bg-[#FFFFFF] px-4 py-15 lg:py-30">
      <div className="mx-auto flex w-full  flex-col items-center gap-12">
        {/* Label + Heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* <img src="/heart.png" alt="Heart" className="h-6 w-6" /> */}
          <Heart className="h-8 w-8 text-red-500 fill-current" />
          <span className="mb-3 text-2xl text-[#6B6B6B] font-normal font-inter tracking-[0.18em] uppercase">
            {t('feature.topTitle')}
          </span>
          <h2 className={`font-rationell font-bold text-[31px] lg:text-[40px]  lg:px-0 leading-tight text-[#1A1A1A] ${i18n.language != 'ko' ? 'lg:w-md': '' }`}>
            {t('feature.title')}
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-2xl bg-[#FCDA70] p-7 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6F6F6]">
                {card.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-inter text-2xl font-medium text-[#2D3436]">{card.title}</h3>
                <p className="text-base leading-relaxed text-[#6B6B6B]">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
