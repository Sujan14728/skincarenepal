import type { Config } from 'tailwindcss';

// Theme colors are CSS variables (hex or oklch). Wrapping them in color-mix
// keeps Tailwind opacity modifiers (bg-primary/10, ring-ring/50) working.
const token = (name: string) =>
  `color-mix(in srgb, var(${name}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bricolage)', 'var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace']
      },
      colors: {
        canvas: token('--canvas'),
        pine: {
          DEFAULT: token('--pine'),
          raised: token('--pine-raised'),
          line: token('--pine-line'),
          foreground: token('--pine-foreground'),
          muted: token('--pine-muted'),
          accent: token('--pine-accent')
        },
        background: token('--background'),
        foreground: token('--foreground'),
        card: {
          DEFAULT: token('--card'),
          foreground: token('--card-foreground')
        },
        popover: {
          DEFAULT: token('--popover'),
          foreground: token('--popover-foreground')
        },
        primary: {
          DEFAULT: token('--primary'),
          foreground: token('--primary-foreground')
        },
        secondary: {
          DEFAULT: token('--secondary'),
          foreground: token('--secondary-foreground')
        },
        muted: {
          DEFAULT: token('--muted'),
          foreground: token('--muted-foreground')
        },
        accent: {
          DEFAULT: token('--accent'),
          foreground: token('--accent-foreground')
        },
        destructive: {
          DEFAULT: token('--destructive'),
          foreground: token('--destructive-foreground')
        },
        border: token('--border'),
        input: token('--input'),
        ring: token('--ring'),
        chart: {
          '1': token('--chart-1'),
          '2': token('--chart-2'),
          '3': token('--chart-3'),
          '4': token('--chart-4'),
          '5': token('--chart-5')
        },
        sidebar: {
          DEFAULT: token('--sidebar'),
          foreground: token('--sidebar-foreground'),
          primary: token('--sidebar-primary'),
          'primary-foreground': token('--sidebar-primary-foreground'),
          accent: token('--sidebar-accent'),
          'accent-foreground': token('--sidebar-accent-foreground'),
          border: token('--sidebar-border'),
          ring: token('--sidebar-ring')
        }
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(15 23 42 / 0.05)'
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)'
      }
    }
  },
  plugins: []
};

export default config;
