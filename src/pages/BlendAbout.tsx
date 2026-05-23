import Section from "@/components/Section";

import { Users, Heart, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BlenAbout() {
  const {t, i18n} = useTranslation();
const lang = i18n.language;
  return (
    <Section id="about" className="flex items-center bg-[#F6F6F6] justify-center py-12 lg:py-24">
      <div className="container overflow-hidden rounded-2xl py-8 md:py-12 bg-[#F0F0F0]">

        {/* ── HERO ── */}
        <div className="relative p-3 lg:p-8 sm:p-10 pb-6">
          <p className="text-[20px] font-normal  font-rationell tracking-widest uppercase mb-3 text-[#1A1A1A]">
            {t('aboutContent.topTitle')}
          </p>
          <h1 className={`font-rationell tracking-[1px] text-lg lg:text-[32px]  font-semibold  mb-4  ${ lang != 'ko' ? 'max-w-110' : ''}   text-[#1A1A1A]`}>
            {t('aboutContent.title')}
          </h1>
          <p className="text-[20px] leading-relaxed lg:w-[65%] font-inter text-[#6B6B6B]">
           {t('aboutContent.description')}
          </p>
          {/* <button className="mt-5 sm:mt-0 sm:absolute sm:top-10 sm:right-10 shadow-xs hover:transition-colors text-[18px] cursor-pointer font-semibold px-5 py-2.5 rounded-full bg-[#222222]  text-[#F6F6F6]"> 
          {t('aboutContent.button')}
          </button> */}
        </div>

        

        {/* ── CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-3 sm:px-10  py-5 lg:py-9">

          {/* Our Mission */}
          <div className="rounded-xl p-5 bg-[#FFFFFF]">
            <div className="flex items-center gap-2 lg:gap-3 mb-3">
              <span className="text-base">
                <img src="/mission.png" alt="Our Mission" className="w-6 h-6" />
              </span>
              <span className="text-[28px] font-bold font-rationell  text-[#1A1A1A]">{t('aboutContent.ourMission.title')}</span>
            </div>
            <p className="text-base mb-3 leading-7 font-normal text-[#64717C] mt-1">
              {t('aboutContent.ourMission.text1')}
            </p>
            <p className="text-base mb-3 leading-7 font-normal text-[#64717C] mg-1">
              {t('aboutContent.ourMission.text2')}
            </p>
            <p className="text-base leading-7 font-normal text-[#64717C] mt-1">
              {t('aboutContent.ourMission.text3')}
            </p>
          </div>

          {/* What Do We Do */}
          <div className="rounded-xl p-5 bg-[#ffffff]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">
                <img src="/we-do.png"  className="w-6 h-6" />
                </span>
              <span className="text-[28px]  font-rationell font-bold text-[#1A1A1A]">{t('aboutContent.whatWeDo.title')}</span>
            </div>
            {/* <p className="leading-7 mb-3 text-[#6B6B6B] font-normal font-inter text-base">
             {t('aboutContent.whatWeDo.text1')}
            </p> */}
            <p className="text-base font-normal font-inter mb-2 text-[#6B6B6B]">
               {t('aboutContent.whatWeDo.subTitle')}</p>
            <ul className="space-y-1.5 ">
              {[
                t('aboutContent.whatWeDo.list1'),
                t('aboutContent.whatWeDo.list2'),
                t('aboutContent.whatWeDo.list3'),
                t('aboutContent.whatWeDo.list4'),
                t('aboutContent.whatWeDo.list5'),
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 px-2 py-2 shadow-sm rounded-lg leading-7 mb-3"
                    style={{ borderColor: 'var(--border)' }}>
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--text-primary)' }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <polyline points="1,4 3,6 7,2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-base text-[#6B6B6B] leading-snug font-inter font-normal">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Approach */}
          <div className="rounded-xl p-5 bg-[#FFFFFF]">
            <div className="flex items-center gap-2 mb-3">
              <img src="/approch.png" className="w-6 h-6" />
              <span className="text-[28px] font-bold font-rationell text-[#1A1A1A]"
                    style={{ color: 'var(--text-primary)' }}>{t('aboutContent.approach.title')}</span>
            </div>
            
            <p className="text-base font-normal font-inter mb-2 text-[#6B6B6B]">{t('aboutContent.approach.subTitle')}</p>
            <ul className="space-y-1.5">
              {[
                t('aboutContent.approach.list1'),
                t('aboutContent.approach.list2'),
                t('aboutContent.approach.list3'),
                t('aboutContent.approach.list4')
              ].map((item) => (
               <li key={item} className="flex items-start gap-2 px-2 py-2 mb-6 leading-7 shadow-sm rounded-lg"
                    style={{ borderColor: 'var(--border)' }}>
                  <span className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--text-primary)' }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <polyline points="1,4 3,6 7,2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-base text-[#6B6B6B] leading-snug font-inter font-normal">{item}</span>
                </li>
              ))}
            </ul>
            {/* <p className="text-base leading-relaxed text-[#6B6B6B]">
              {t('aboutContent.approach.text2')}
            </p> */}
          </div>
        </div>

        {/* ── CONTACT BAR ── */}
        <div className="px-8 sm:px-10 py-6 lg:mt-15 flex flex-col rounded-xl sm:flex-row sm:items-center gap-6 bg-[#1A1A1A]">
          {/* Left */}
          <div className="flex-1">
            <h2 className="text-[32px] font-semibold text-[#F6F6F6] mb-4"

                style={{ color: 'var(--bg-primary)' }}>{t('aboutContent.contact.title')}</h2>

            <span className="inline-block text-base font-normal px-3 py-1 rounded-full mb-4 bg-[#FCDA70] text-[#6B6B6B]">
             {t('aboutContent.contact.email')}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                t('aboutContent.contact.text1'),
                t('aboutContent.contact.text2'),
                t('aboutContent.contact.text3')
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-base px-3 py-0.5 rounded-full text-[#6B6B6B] bg-[#F6F6F6]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 sm:gap-10">
            <div className="text-center">

              <Users className="w-5 h-5 mx-auto mb-1 text-[#F6F6F6]" />
              <div className="text-[32px] font-semibold text-[#F6F6F6] leading-none">{
                    t('aboutContent.contact.stats.users')
                   }</div>
              <div className="text-[12px] lg:text-[14px]  mt-2 text-[#6B6B6B]">{t('aboutContent.contact.stats.usersLabel')}</div>
            </div>

            <div className="text-center">
              <Heart  className="w-5 h-5 mx-auto mb-1 text-[#F6F6F6]" />
               <div className="text-[32px] font-semibold text-[#F6F6F6] leading-none">{t('aboutContent.contact.stats.matches')}</div>
             <div className="text-[12px] lg:text-[14px]  mt-2 text-[#6B6B6B]">{t('aboutContent.contact.stats.matchesLabel')}</div>
            </div>
            <div className="text-center">
              <Globe className="w-5 h-5 mx-auto mb-1 text-[#F6F6F6]" />
             <div className="text-[32px] font-semibold text-[#F6F6F6] leading-none">{t('aboutContent.contact.stats.country')}</div>
                <div className="text-[12px] lg:text-[14px] mt-2 text-[#6B6B6B]">{t('aboutContent.contact.stats.countryLabel')}</div>
            </div>
          </div>
        </div>

      </div>
    </Section>
  );
}