import React from "react";

// types
interface DetailCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  colorClass: string;
}

const BentoDetailCard: React.FC<DetailCardProps> = ({
  icon: Icon,
  title,
  value,
  colorClass,
}) => {
  // Preserving your logic for dynamic icon backgrounds
  const getIconBgClass = (className: string) =>
    className.replace("text-", "bg-").replace("-600", "-100");

  return (
    // bg-white -> bg-[var(--card)], border-gray-300 -> border-[var(--line)]
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--card)] shadow-sm border border-[var(--line)]">
      <div
        className={`p-3 rounded-full ${getIconBgClass(
          colorClass
        )} ${colorClass} shrink-0`}
      >
        <Icon size={20} />
      </div>

      <div className="flex flex-col justify-center grow space-y-2">
        {/* text-gray-500 -> text-[var(--foreground-muted)] */}
        <p className="text-md sm:text-sm text-[var(--foreground-muted)] font-semibold">
          {title}
        </p>
        {/* text-gray-800 -> text-[var(--title)] */}
        <p className="font-bold text-base text-[var(--text)] wrap-break-word leading-none">
          {value}
        </p>
      </div>
    </div>
  );
};

export default BentoDetailCard;