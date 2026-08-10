// src/components/Spinner.tsx
export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-10 w-10' }[size];
  return (
    <div className={`${cls} animate-spin rounded-full border-2 border-green-700 border-t-transparent`} />
  );
}
