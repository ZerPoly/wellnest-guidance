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
  const getIconBgClass = (className: string) =>
    className.replace("text-", "bg-").replace("-600", "-100");

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white shadow-sm border border-gray-300">
      <div
        className={`p-3 rounded-full ${getIconBgClass(
          colorClass
        )} ${colorClass} shrink-0`}
      >
        <Icon size={20} />
      </div>

      <div className="flex flex-col justify-center grow space-y-2">
        <p className="text-md sm:text-sm text-gray-500 font-semibold">
          {title}
        </p>
        <p className="font-bold text-base text-gray-800 wrap-break-word leading-none">
          {value}
        </p>
      </div>
    </div>
  );
};

export default BentoDetailCard;