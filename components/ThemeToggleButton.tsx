import { useTheme } from '@/components/ThemeProvider';
import { IoSunny } from "react-icons/io5";
import { IoMoon } from "react-icons/io5";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-[var(--bg-light)] hover:bg-[var(--bg-dark)] rounded-lg transition-colors"
    >
      {theme === 'light' ? <IoSunny className="w-5 h-5 text-amber-400" /> : <IoMoon className="w-5 h-5" />}
    </button>
  );
}