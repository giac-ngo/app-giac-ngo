import React from 'react';

// Define a common props interface for icons to accept a className
interface IconProps {
  className?: string;
}

export const AiIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10,0,0,0,2,12A10,10,0,0,0,12,22A10,10,0,0,0,22,12A10,10,0,0,0,12,2M12,4A8,8,0,0,1,20,12A8,8,0,0,1,12,20A8,8,0,0,1,4,12A8,8,0,0,1,12,4M8.5,8A1.5,1.5,0,1,1,7,9.5A1.5,1.5,0,0,1,8.5,8M15.5,8A1.5,1.5,0,1,1,14,9.5A1.5,1.5,0,0,1,15.5,8M8,14H16V16H8V14Z" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.43,12.98C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.65 15.48,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.52,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.98L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.52,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.48,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.98M12,15.5C10.07,15.5 8.5,13.93 8.5,12C8.5,10.07 10.07,8.5 12,8.5C13.93,8.5 15.5,10.07 15.5,12C15.5,13.93 13.93,15.5 12,15.5Z" />
  </svg>
);

export const ConversationIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
    </svg>
);

export const PricingIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zm-2-4h8v2H8v-2zm4 8h-4v2h4v-2z" />
    </svg>
);

export const BillingIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
    </svg>
);

export const TemplateIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.5a6.5 6.5 0 0 1 6.5 6.5c0 1.8-1.5 4-6.5 9.5-5-5.5-6.5-7.7-6.5-9.5A6.5 6.5 0 0 1 12 2.5zm0 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm-10 8.5h20v1H2v-1z" />
    </svg>
);

export const FineTuneIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm5-1v-3h2v3h-2zm-4-1v-5h2v5H7zm8-1v-4h2v4h-2z" />
    </svg>
);

export const SpeakerOnIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

export const SpeakerOffIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l4-4m0 0l-4-4m4 4H7" />
    </svg>
);

export const CryptoIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2.55c-1.16.54-2 1.74-2 3.12 0 1.38.84 2.58 2 3.12V17h-2v-2.1c-1.74-.63-3-2.26-3-4.23s1.26-3.6 3-4.23V7zm4 4.5c0-1.74-1.26-3.17-3-3.65v7.3c1.74-.48 3-1.91 3-3.65z" />
    </svg>
);

export const UsdtIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#26A17B"/>
        <path d="M16.488 7.14397H21.432V11.2H19.788V8.81197H18.156V11.2H16.488V7.14397Z" fill="white"/>
        <path d="M11.664 7.14397H14.856V11.2H13.212V8.81197H11.664V7.14397Z" fill="white"/>
        <path d="M11.664 12.876H18.156V14.508H15.684V24.852H14.04V14.508H11.664V12.876Z" fill="white"/>
    </svg>
);

export const UsdcIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#2775CA"/>
        <path d="M16 26C21.523 26 26 21.523 26 16C26 10.477 21.523 6 16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26Z" fill="#fff"/>
        <path d="M16.335 21.517c-2.32.001-4.202-1.874-4.203-4.18V14.66c0-1.127.46-2.183 1.222-2.942a4.23 4.23 0 0 1 2.98-1.235c2.32-.001 4.202 1.874 4.203 4.18v.57h-2.19v-.57c0-1.112-.9-2.008-2.013-2.008-1.116 0-2.017.896-2.017 2.008v2.676c0 1.112.901 2.008 2.017 2.008s2.013-.896 2.013-2.008v-.56h2.19v.56c-.001 2.307-1.883 4.18-4.202 4.181zM20.24 16.516h-2.184v-1.15h2.184v1.15z" fill="#2775CA"/>
    </svg>
);

export const EthIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#627EEA"/>
        <path d="M16.324 4.498L16.16 5.106V17.31L23.638 12.8L16.324 4.498Z" fill="white" fillOpacity="0.6"/>
        <path d="M16.324 4.498L9 12.8L16.324 17.31V4.498Z" fill="white"/>
        <path d="M16.324 18.423V27.5L23.642 13.912L16.324 18.423Z" fill="white" fillOpacity="0.6"/>
        <path d="M16.324 27.5V18.423L9 13.912L16.324 27.5Z" fill="white"/>
        <path d="M16.324 17.31L23.638 12.8L16.324 8.292V17.31Z" fill="white" fillOpacity="0.2"/>
        <path d="M9 12.8L16.324 17.31V8.292L9 12.8Z" fill="white" fillOpacity="0.6"/>
    </svg>
);