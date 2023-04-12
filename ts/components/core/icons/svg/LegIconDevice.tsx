import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconDevice = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 21.484C0 22.872 1.087 24 2.422 24H11.023c1.335 0 2.421-1.128 2.421-2.516V2.516C13.444 1.129 12.358 0 11.023 0H2.422C1.087 0 0 1.129 0 2.516V21.484ZM1.438 3.196h10.568v-.454c0-.674-.519-1.222-1.157-1.222H2.595c-.638 0-1.157.548-1.157 1.222v.454Zm0 14.784h10.568V4.717H1.438V17.98Zm0 1.519v1.759c0 .674.52 1.223 1.157 1.223h8.254c.638 0 1.157-.55 1.157-1.223v-1.759H1.438Zm14.683-3.303a.95.95 0 0 0 .626.225.954.954 0 0 0 .586-.192c1.434-1.11 2.223-2.612 2.223-4.23 0-1.615-.79-3.117-2.223-4.228a.989.989 0 0 0-1.212.032.646.646 0 0 0-.232.51c.008.19.105.366.272.494 1.083.841 1.679 1.975 1.679 3.193s-.596 2.351-1.677 3.192a.656.656 0 0 0-.274.495.642.642 0 0 0 .232.509Zm-9.093 4.768a.19.19 0 0 1 .188.194.19.19 0 0 1-.188.193.19.19 0 0 1-.188-.193.19.19 0 0 1 .188-.194Zm0 1.141c.506 0 .916-.423.916-.947 0-.522-.41-.948-.916-.948-.507 0-.917.426-.917.948 0 .524.41.947.917.947Zm11.495-3.404a.65.65 0 0 0 .5.246.64.64 0 0 0 .476-.22C21.112 16.95 22 14.56 22 12.001c0-2.558-.888-4.947-2.501-6.725-.133-.147-.304-.237-.491-.222a.652.652 0 0 0-.483.246.883.883 0 0 0 .02 1.122c1.34 1.476 2.077 3.458 2.077 5.579 0 2.122-.737 4.102-2.077 5.579a.883.883 0 0 0-.022 1.12Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconDevice;