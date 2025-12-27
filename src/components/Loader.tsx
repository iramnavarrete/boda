import { FC } from "react";

interface Props {
  fullscreen?: boolean;
}

const Loader: FC<Props> = ({ fullscreen = false }) => {
  return (
    <div
      className={`${
        fullscreen ? "min-h-screen" : ""
      } bg-stone-50 flex items-center justify-center`}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
    </div>
  );
};

export default Loader;
