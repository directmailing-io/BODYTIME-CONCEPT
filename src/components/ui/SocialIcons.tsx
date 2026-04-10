// Brand SVG icons for social media platforms

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-bg" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-bg)" />
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
    </svg>
  );
}

export function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#1877F2" />
      <path
        d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.2 12.5H13V19H10.5V12.5H9V10H10.5V8.5C10.5 6.6 11.8 5 14 5H15.5V8Z"
        fill="white"
      />
    </svg>
  );
}

export function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path
        d="M20 8.5C20 8.5 19.8 7.2 19.2 6.6C18.5 5.9 17.7 5.9 17.3 5.8C14.8 5.6 11 5.6 11 5.6C11 5.6 7.2 5.6 4.7 5.8C4.3 5.9 3.5 5.9 2.8 6.6C2.2 7.2 2 8.5 2 8.5S1.8 10 1.8 11.5V12.9C1.8 14.4 2 15.9 2 15.9C2 15.9 2.2 17.2 2.8 17.8C3.5 18.5 4.5 18.5 4.9 18.6C6.4 18.7 11 18.8 11 18.8C11 18.8 14.8 18.7 17.3 18.5C17.7 18.4 18.5 18.4 19.2 17.7C19.8 17.1 20 15.8 20 15.8C20 15.8 20.2 14.3 20.2 12.8V11.4C20.2 9.9 20 8.5 20 8.5Z"
        fill="#FF0000"
      />
      <path d="M9.5 9.5V14.5L14.5 12L9.5 9.5Z" fill="white" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#0A66C2" />
      <path
        d="M7.5 10H5V19H7.5V10ZM6.25 9C7.08 9 7.75 8.33 7.75 7.5C7.75 6.67 7.08 6 6.25 6C5.42 6 4.75 6.67 4.75 7.5C4.75 8.33 5.42 9 6.25 9ZM19 19H16.5V14.5C16.5 13.4 16.48 12 14.97 12C13.44 12 13.2 13.2 13.2 14.42V19H10.7V10H13.1V11.25H13.13C13.47 10.63 14.27 9.97 15.47 9.97C18 9.97 19 11.6 19 13.75V19Z"
        fill="white"
      />
    </svg>
  );
}

export function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#010101" />
      <path
        d="M17.5 7.2C16.5 7.2 15.7 6.4 15.7 5.4H13.5V14.8C13.5 15.7 12.8 16.4 11.9 16.4C11 16.4 10.3 15.7 10.3 14.8C10.3 13.9 11 13.2 11.9 13.2C12.1 13.2 12.3 13.2 12.5 13.3V11C12.3 11 12.1 10.9 11.9 10.9C9.8 10.9 8.1 12.6 8.1 14.7C8.1 16.8 9.8 18.5 11.9 18.5C14 18.5 15.7 16.8 15.7 14.7V9.8C16.6 10.4 17.7 10.8 18.9 10.8V8.6C18.1 8.6 17.5 8 17.5 7.2Z"
        fill="white"
      />
      <path
        d="M17.5 7.2C16.5 7.2 15.7 6.4 15.7 5.4H13.5V14.8C13.5 15.7 12.8 16.4 11.9 16.4C11 16.4 10.3 15.7 10.3 14.8C10.3 13.9 11 13.2 11.9 13.2C12.1 13.2 12.3 13.2 12.5 13.3V11C12.3 11 12.1 10.9 11.9 10.9C9.8 10.9 8.1 12.6 8.1 14.7C8.1 16.8 9.8 18.5 11.9 18.5C14 18.5 15.7 16.8 15.7 14.7V9.8C16.6 10.4 17.7 10.8 18.9 10.8V8.6C18.1 8.6 17.5 8 17.5 7.2Z"
        fill="#EE1D52"
        opacity="0.4"
      />
    </svg>
  );
}
