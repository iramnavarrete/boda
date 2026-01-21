import { cn } from "@heroui/theme";
import { FC } from "react";

type Props = { className?: string };

const DashedSeparator: FC<Props> = ({ className }) => {
  return (
    <div
      className={cn(
        "my-1.5 border-t border-sand mx-3 border-dashed border-opacity-60",
        className
      )}
    />
  );
};

export default DashedSeparator;
