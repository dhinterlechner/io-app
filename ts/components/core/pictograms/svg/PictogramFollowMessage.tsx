import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGPictogramProps } from "../Pictogram";

const PictogramFollowMessage = ({
  size,
  color,
  ...props
}: SVGPictogramProps) => (
  <Svg fill="none" width={size} height={size} viewBox="0 0 240 240" {...props}>
    <Path
      d="M70.1904 128.004h-.001v99.65c-1.8251 0-3.5729.006-5.2671.012-3.7844.013-7.3011.025-10.8128-.033-4.2757-.073-7.15 1.816-7.1091 6.276.0307 4.198 2.9869 6.056 6.8943 6.066 14.8217.053 29.6536.042 44.4753 0 4.112-.01 7.171-1.784 7.038-6.391-.133-4.618-3.243-6.045-7.3857-5.961-3.4687.072-6.9423.055-10.5695.037-1.6568-.008-3.3457-.016-5.0808-.016v-5.783c0-4.128 0-83.099.01-91.814.3478-2.607 1.6229-4.119 4.4713-5.444 21.6317-10.007 43.2077-20.149 64.7807-30.2908 5.939-2.792 11.878-5.5839 17.818-8.3729 1.844-.8651 3.698-1.7141 5.552-2.5632 4.982-2.282 9.967-4.565 14.783-7.1656 1.892-1.0285 3.846-3.7677 3.958-5.8353.077-1.4617-1.561-3.1206-3.009-4.5869-.288-.2918-.568-.576-.826-.8495-.525-.5598-1.322-.8448-2.121-1.1302-.369-.1318-.738-.2638-1.081-.423-8.888-4.1733-17.774-8.3516-26.66-12.53C137.56 40.281 115.071 29.7061 92.5406 19.212c-.5023-.2335-1.0056-.4605-1.5054-.6859-5.3827-2.4275-10.3432-4.6645-8.9485-12.89461.5421-3.27444-2.4141-5.77226-6.0453-5.62533-3.5597.14693-5.5441 2.38237-5.8101 6.03464-.081 1.12627-.0665 2.25798-.0521 3.3873.0056.43867.0112.877.0112 1.3145V128.004Z"
      fill="#AAEEEF"
    />
    <Path
      d="M86.197 24.8741c.3501-.7508 1.2425-1.0757 1.9933-.7257l73.9997 34.5c.751.3501 1.076 1.2425.726 1.9934-.35.7508-1.242 1.0757-1.993.7256l-74.0003-34.5c-.7509-.35-1.0758-1.2425-.7257-1.9933Z"
      fill="#00C5CA"
    />
  </Svg>
);

export default PictogramFollowMessage;