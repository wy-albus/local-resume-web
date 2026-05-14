/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Microsoft YaHei',
          'PingFang SC',
          'Noto Sans SC',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        resumeBlue: '#1f4e79',
        sectionBlue: '#e7edf3',
        ink: '#444444',
      },
      boxShadow: {
        resume: '0 16px 40px rgba(15, 23, 42, 0.14)',
      },
    },
  },
  plugins: [],
};
