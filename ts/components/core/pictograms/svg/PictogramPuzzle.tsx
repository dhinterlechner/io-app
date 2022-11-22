import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGPictogramProps } from "../Pictogram";

const PictogramPuzzle = ({ size, color, ...props }: SVGPictogramProps) => (
  <Svg fill="none" width={size} height={size} viewBox="0 0 120 120" {...props}>
    <Path
      fill={color}
      d="M60 0v3.871c-25.171 0-47.421 16.926-54.11 41.16l-3.732-1.03C9.308 18.095 33.093 0 60 0ZM116.129 60c0 1.258-.041 2.507-.122 3.745l3.863.254c.085-1.322.13-2.667.13-3.999h-3.871ZM115.006 71.228l3.794.768a59.59 59.59 0 0 0 .672-3.999l-3.837-.513a56.245 56.245 0 0 1-.629 3.744ZM60 116.129V120c26.907 0 50.692-18.095 57.842-44.001l-3.732-1.03c-6.689 24.234-28.939 41.16-54.11 41.16ZM48.468 90.066l2.737-2.737 2.737 2.737-2.737 2.736-2.737-2.736ZM56.68 81.855l-2.736 2.737 2.737 2.736 2.736-2.736-2.736-2.737ZM45.733 92.799l-2.6 2.6 2.737 2.737 2.6-2.6-2.737-2.737ZM.528 52.003l3.837.513a55.91 55.91 0 0 1 .629-3.744L1.2 48.004a59.395 59.395 0 0 0-.672 3.999ZM3.871 60H0c0-1.332.045-2.677.13-3.999l3.863.254A57.178 57.178 0 0 0 3.87 60ZM60 112.258c1.341 0 2.694-.05 4.018-.153l-.294-3.859c-1.227.095-2.48.141-3.724.141v3.871Z"
    />
    <Path
      fill={color}
      d="M72.058 110.861a53.013 53.013 0 0 1-4.02.784l-.592-3.825a49.077 49.077 0 0 0 3.722-.726l.89 3.767ZM74.888 106.053l1.19 3.683c21.64-6.991 36.18-26.979 36.18-49.736h-3.871c0 21.073-13.461 39.58-33.5 46.053ZM60 7.742v3.87c-1.245 0-2.497.047-3.724.142l-.294-3.86A52.26 52.26 0 0 1 60 7.743ZM48.832 12.908a49.224 49.224 0 0 1 3.722-.726l-.592-3.827a52.279 52.279 0 0 0-4.02.784l.89 3.769ZM43.922 10.264l1.19 3.683c-20.038 6.472-33.5 24.98-33.5 46.053h-3.87c0-22.757 14.54-42.745 36.18-49.736Z"
    />
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="m89.834 63.871-3.635-3.635a3.515 3.515 0 0 1-1.038-2.502 3.543 3.543 0 0 1 3.54-3.54c.945 0 1.833.367 2.503 1.037l3.635 3.635 14.349-14.35-11.612-11.613.898-.898a7.36 7.36 0 0 0 2.171-5.24 7.418 7.418 0 0 0-7.41-7.41c-1.979 0-3.84.77-5.24 2.171l-.898.898-11.613-11.612-14.35 14.35 3.635 3.634a3.515 3.515 0 0 1 1.037 2.503 3.543 3.543 0 0 1-3.54 3.54 3.515 3.515 0 0 1-2.502-1.038l-3.635-3.635-23.226 23.226-.898-.898a7.36 7.36 0 0 0-5.24-2.171 7.418 7.418 0 0 0-7.41 7.41c0 1.979.77 3.84 2.171 5.24l.898.898-11.612 11.613 33.704 33.704 45.318-45.317ZM56.129 35.64l.898.898a7.36 7.36 0 0 0 5.24 2.172 7.418 7.418 0 0 0 7.41-7.411c0-1.978-.77-3.84-2.171-5.24l-.898-.898 8.876-8.876 11.613 11.613 3.635-3.635a3.515 3.515 0 0 1 2.502-1.037 3.543 3.543 0 0 1 3.54 3.54c0 .944-.368 1.833-1.037 2.502l-3.635 3.635 11.613 11.613-8.876 8.876-.898-.898a7.36 7.36 0 0 0-5.24-2.171 7.418 7.418 0 0 0-7.41 7.41c0 1.979.77 3.84 2.17 5.24l.899.898-8.876 8.876L63.87 61.134l-3.635 3.635a3.515 3.515 0 0 1-2.502 1.037 3.543 3.543 0 0 1-3.54-3.54c0-.944.367-1.832 1.037-2.502l3.635-3.635-11.613-11.613 8.876-8.876ZM16.285 75.484l28.231 28.231 28.231-28.231-8.876-8.876-.898.898a7.357 7.357 0 0 1-5.24 2.171 7.418 7.418 0 0 1-7.41-7.41 7.36 7.36 0 0 1 2.171-5.24l.898-.898-8.876-8.876-11.613 11.613-3.635-3.635a3.515 3.515 0 0 0-2.502-1.037 3.543 3.543 0 0 0-3.54 3.54c0 .944.367 1.832 1.037 2.502l3.635 3.635-11.613 11.613Z"
    />
  </Svg>
);

export default PictogramPuzzle;