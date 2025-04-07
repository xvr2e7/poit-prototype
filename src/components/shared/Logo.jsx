import React from "react";
import { useTheme } from "./AdaptiveBackground";

const Logo = ({ size = "medium", onClick }) => {
  const { isDark } = useTheme();

  const dimensions = {
    large: { width: 200, height: 200 },
    medium: { width: 100, height: 100 },
    small: { width: 40, height: 40 },
    tiny: { width: 24, height: 24 },
  }[size];

  const logoSrc = isDark ? "/favicon_dark.svg" : "/favicon_light.svg";

  return (
    <img
      src={logoSrc}
      alt="POiT"
      width={dimensions.width}
      height={dimensions.height}
      className={onClick ? "cursor-pointer" : ""}
      onClick={onClick}
    />
  );
};

export default Logo;
