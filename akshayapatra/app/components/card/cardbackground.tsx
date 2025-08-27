'use client'

import React from 'react'
import { 
  Bell, Moon, Search, Settings, ShieldBan, CreditCard, Upload, Plus,
  ChevronRight, Lock, Users, Home, Phone, QrCode, History, Send,
  Building2, Sun, ArrowRightLeft, 
} from 'lucide-react'
import { BankAccountCard } from '@/app/components/card/bankaccountcard'

// Dynamic Card Background Component
interface CardBackgroundProps {
  className?: string;
  fillColors?: {
    paint0?: string;
    paint1?: string;
    paint2?: string;
    paint3?: string;
    paint4?: string;
    paint5?: string;
  }
}

export const CardBackground: React.FC<CardBackgroundProps> = ({ className = "", fillColors = {} }) => {
  // Generate unique ID for this card instance to prevent gradient conflicts
  const uniqueId = React.useMemo(() => Math.random().toString(36).substr(2, 9), []);
  
  // Debug logging to verify different colors are being applied
  React.useEffect(() => {
    console.log('🎭 CardBackground rendered with colors:', fillColors, 'uniqueId:', uniqueId);
  }, [fillColors, uniqueId]);
  
  return (
    <div className={className}>
     <svg
        width="299"
        height="171"
        viewBox="0 0 299 171"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="bg-svg"
        style={{
          width: '298.871px',
          height: '170.783px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <path
          d="M298.791 16.125L298.871 154.525C298.88 163.423 290.872 170.648 281.001 170.656L17.9683 170.785C16.3275 170.785 14.7313 170.584 13.2243 170.206C5.65355 168.339 0.0891802 162.096 0.0802629 154.67L7.44866e-06 16.2699C-0.00890981 7.37146 7.98987 0.138495 17.8702 0.138495L280.912 0.00976562C284.434 0.00976562 287.742 0.935005 290.507 2.54412C295.491 5.39225 298.791 10.4046 298.791 16.125Z"
          fill={`url(#paint0_linear_bg_${uniqueId})`}
        />
        <path
          opacity="0.53"
          d="M207.164 170.696L17.9666 170.784C16.3259 170.784 14.7297 170.583 13.2227 170.205L97.1519 94.3996C99.6577 92.1307 102.716 90.6664 105.935 90.0469C111.696 88.8722 118 90.3205 122.495 94.3915L207.164 170.696Z"
          fill={`url(#paint1_linear_bg_${uniqueId})`}
        />
        <path
          opacity="0.53"
          d="M81.9942 61.7821L0.0713437 135.777L7.44038e-06 16.2764C-0.00890982 7.36992 7.99879 0.144999 17.8613 0.136954L38.9506 0.128906L81.9853 38.9166C88.9942 45.2163 89.0032 55.4664 81.9942 61.7821Z"
          fill={`url(#paint2_linear_bg_${uniqueId})`}
        />
        <path
          opacity="0.53"
          d="M154.894 0.0664062L129.167 23.3101C122.176 29.6339 110.816 29.6419 103.824 23.3262L78.0625 0.106634L154.894 0.0664062Z"
          fill={`url(#paint3_linear_bg_${uniqueId})`}
        />
        <path
          opacity="0.53"
          d="M298.79 16.1233L298.862 139.727C294.055 139.896 289.178 138.336 285.504 135.013L176.669 36.9211C169.66 30.6134 169.651 20.3553 176.651 14.0395L192.149 0.0402272L280.902 0C284.425 0 287.733 0.925242 290.497 2.53436C295.491 5.39053 298.79 10.4029 298.79 16.1233Z"
          fill={`url(#paint4_linear_bg_${uniqueId})`}
        />
        <g opacity="0.53">
          <path
            d="M298.871 16.1328V154.531C298.871 163.436 290.858 170.664 280.987 170.664H17.8843C8.01251 170.664 0 163.436 0 154.531V16.1328C0 7.22781 8.01251 0 17.8843 0H280.996C284.528 0 287.831 0.926436 290.593 2.53173C295.569 5.38292 298.871 10.4144 298.871 16.1328Z"
            fill={`url(#paint5_linear_bg_${uniqueId})`}
            style={{ mixBlendMode: 'lighten' }}
          />
        </g>
        <defs>
          <linearGradient
            id={`paint0_linear_bg_${uniqueId}`}
            x1="32.7564"
            y1="190.788"
            x2="242.173"
            y2="-41.5713"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={fillColors.paint0 || "#2A0E16"} />
            <stop offset="1" stopColor="#1C0D07" />
          </linearGradient>
          <linearGradient
            id={`paint1_linear_bg_${uniqueId}`}
            x1="13.2012"
            y1="130.244"
            x2="207.139"
            y2="130.126"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#030806" stopOpacity="0.3" />
            <stop offset="1" stopColor={fillColors.paint1 || "#EE6200"} />
          </linearGradient>
          <linearGradient
            id={`paint2_linear_bg_${uniqueId}`}
            x1="-34.9099"
            y1="104.25"
            x2="49.9763"
            y2="10.0636"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#030806" stopOpacity="0.2" />
            <stop offset="1" stopColor={fillColors.paint2 || "#EE6200"} />
          </linearGradient>
          <linearGradient
            id={`paint3_linear_bg_${uniqueId}`}
            x1="97.2787"
            y1="17.4285"
            x2="131.736"
            y2="-20.8042"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#030806" stopOpacity="0.2" />
            <stop offset="1" stopColor={fillColors.paint3 || "#EE6200"} />
          </linearGradient>
          <linearGradient
            id={`paint4_linear_bg_${uniqueId}`}
            x1="465.279"
            y1="163.617"
            x2="150.503"
            y2="-42.6205"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#030806" />
            <stop offset="1" stopColor={fillColors.paint4 || "#EE6200"} />
          </linearGradient>
          <linearGradient
            id={`paint5_linear_bg_${uniqueId}`}
            x1="32.663"
            y1="190.669"
            x2="242.224"
            y2="-41.6439"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={fillColors.paint5 || "#1C0D07"} />
            <stop offset="1" stopColor={fillColors.paint1 || "#EE6200"} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
