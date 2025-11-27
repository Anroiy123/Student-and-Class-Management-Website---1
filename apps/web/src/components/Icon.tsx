import { type SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  name:
    | 'dashboard'
    | 'students'
    | 'classes'
    | 'courses'
    | 'grades'
    | 'reports'
    | 'users'
    | 'moon'
    | 'sun'
    | 'profile'
    | 'my-grades'
    | 'my-courses';
  size?: number;
}

export const Icon = ({ name, size = 32, className, ...props }: IconProps) => {
  const icons = {
    dashboard: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect
          x="2"
          y="2"
          width="12"
          height="12"
          fill="#FFE76A"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="18"
          y="2"
          width="12"
          height="12"
          fill="#B8FFCE"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="2"
          y="18"
          width="12"
          height="12"
          fill="#9AD9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="18"
          y="18"
          width="12"
          height="12"
          fill="#FF9AA2"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    students: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <circle
          cx="16"
          cy="10"
          r="6"
          fill="#B8FFCE"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M6 28C6 22 10 18 16 18C22 18 26 22 26 28"
          fill="#B8FFCE"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    classes: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect
          x="4"
          y="8"
          width="24"
          height="20"
          fill="#9AD9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="8"
          y="4"
          width="16"
          height="4"
          fill="#9AD9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="4"
          y1="14"
          x2="28"
          y2="14"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="4"
          y1="20"
          x2="28"
          y2="20"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    courses: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect
          x="6"
          y="4"
          width="20"
          height="24"
          fill="#FFE76A"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="10"
          x2="22"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="16"
          x2="22"
          y2="16"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="10"
          y1="22"
          x2="18"
          y2="22"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    grades: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M16 4L20 12L28 14L22 20L24 28L16 24L8 28L10 20L4 14L12 12L16 4Z"
          fill="#C7B9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    reports: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect
          x="4"
          y="4"
          width="24"
          height="24"
          fill="#FF9AA2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="8" y="16" width="4" height="8" fill="currentColor" />
        <rect x="14" y="12" width="4" height="12" fill="currentColor" />
        <rect x="20" y="8" width="4" height="16" fill="currentColor" />
      </svg>
    ),
    users: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <circle
          cx="12"
          cy="10"
          r="5"
          fill="#C7B9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="22"
          cy="10"
          r="5"
          fill="#FFE76A"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M4 28C4 23 7 20 12 20C17 20 20 23 20 28"
          fill="#C7B9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M14 28C14 23 17 20 22 20C27 20 30 23 30 28"
          fill="#FFE76A"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    moon: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          fill="#C7B9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    sun: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <circle
          cx="12"
          cy="12"
          r="5"
          fill="#FFE76A"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="12"
          y1="1"
          x2="12"
          y2="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="12"
          y1="21"
          x2="12"
          y2="23"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="4.22"
          y1="4.22"
          x2="5.64"
          y2="5.64"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="18.36"
          y1="18.36"
          x2="19.78"
          y2="19.78"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="1"
          y1="12"
          x2="3"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="21"
          y1="12"
          x2="23"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="4.22"
          y1="19.78"
          x2="5.64"
          y2="18.36"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="18.36"
          y1="5.64"
          x2="19.78"
          y2="4.22"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    profile: (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <circle
          cx="16"
          cy="10"
          r="6"
          fill="#C7B9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 28C8 22 11 19 16 19C21 19 24 22 24 28"
          fill="#C7B9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="4"
          y="4"
          width="24"
          height="24"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    'my-grades': (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect
          x="4"
          y="4"
          width="24"
          height="24"
          fill="#B8FFCE"
          stroke="currentColor"
          strokeWidth="2"
        />
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="currentColor"
        >
          A+
        </text>
      </svg>
    ),
    'my-courses': (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
      >
        <rect
          x="4"
          y="6"
          width="18"
          height="22"
          fill="#9AD9FF"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="10"
          y="4"
          width="18"
          height="22"
          fill="#FFE76A"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="14"
          y1="10"
          x2="24"
          y2="10"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="14"
          y1="15"
          x2="24"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="14"
          y1="20"
          x2="20"
          y2="20"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  };

  return icons[name] || null;
};
