/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable functional/immutable-data */
import {
  ButtonLink,
  ButtonOutline,
  ButtonSolid,
  HeaderSecondLevel,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import {
  ComponentProps,
  Fragment,
  PropsWithChildren,
  useLayoutEffect,
  useState
} from "react";
import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  RefreshControl,
  RefreshControlProps,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { easeGradient } from "react-native-easing-gradient";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  AnimatedRef,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WithTestID } from "../../types/WithTestID";
import { useStatusAlertProps } from "../../hooks/useStatusAlertProps";

export type IOScrollViewActions =
  | {
      type: "SingleButton";
      primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondary?: never;
      tertiary?: never;
    }
  | {
      type: "TwoButtons";
      primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondary: Omit<ComponentProps<typeof ButtonLink>, "color">;
      tertiary?: never;
    }
  | {
      type: "ThreeButtons";
      primary: Omit<ComponentProps<typeof ButtonSolid>, "fullWidth">;
      secondary: Omit<
        ComponentProps<typeof ButtonOutline>,
        "fullWidth" | "color"
      >;
      tertiary: Omit<ComponentProps<typeof ButtonLink>, "color">;
    };

type IOSCrollViewHeaderScrollValues = ComponentProps<
  typeof HeaderSecondLevel
>["scrollValues"];

type IOScrollView = WithTestID<
  PropsWithChildren<{
    headerConfig?: ComponentProps<typeof HeaderSecondLevel>;
    actions?: IOScrollViewActions;
    debugMode?: boolean;
    animatedRef?: AnimatedRef<Animated.ScrollView>;
    snapOffset?: number;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    /* Don't include end content margin */
    excludeEndContentMargin?: boolean;
    /* Include page margins */
    includeContentMargins?: boolean;
    /* Center content in iOS without inertial scrolling */
    centerContent?: boolean;
    refreshControlProps?: RefreshControlProps;
    contentContainerStyle?: ViewStyle;
  }>
>;

/* Percentage of scrolled content that triggers
   the gradient opaciy transition */
const gradientOpacityScrollTrigger = 0.85;
/* Extended gradient area above the actions */
const gradientSafeAreaHeight: IOSpacingScale = 96;
/* End content margin before the actions */
const contentEndMargin: IOSpacingScale = 32;
/* Margin between ButtonSolid and ButtonOutline */
const spaceBetweenActions: IOSpacer = 16;
/* Margin between ButtonSolid and ButtonLink */
const spaceBetweenActionAndLink: IOSpacer = 16;
/* Extra bottom margin for iPhone bottom handle because
   ButtonLink doesn't have a fixed height */
const extraSafeAreaMargin: IOSpacingScale = 8;

const styles = StyleSheet.create({
  gradientBottomActions: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    justifyContent: "flex-end"
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject
  },
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  },
  centerContentWrapper: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center"
  }
});

/**
 * The main scrollable container component.
 * It includes full support for custom headers and actions.
 *
 * @param [headerConfig] Configuration for the header component. Use this only if you need to configure a custom header from scratch.
 * If you need the predefined configuration with default `Back (<)` and `Help (?)` buttons, use `useHeaderSecondLevel`
 * @param {IOScrollViewActions} [actions] Actions to be rendered at the bottom of the `ScrollView`
 * @param [animatedRef] Ref generated through `useAnimatedRef` (used by `useScrollViewOffset` to get the scroll position)
 * @param {number} [snapOffset] Offset when you need to add a snap point
 * @param {boolean} [excludeSafeAreaMargins=false] Exclude safe area margins at the bottom of the `ScrollView`
 * This is useful if you have a screen with a tab bar at the bottom, or if the bottom margin is already being managed
 * @param {boolean} [excludeEndContentMargin=false] Exclude the end content margin
 * @param {boolean} [includeContentMargins=true] Include horizontal screen margins
 * @param {boolean} [debugMode=false] Enable debug mode. Only for testing purposes
 */
export const IOScrollView = ({
  headerConfig,
  children,
  actions,
  snapOffset,
  excludeSafeAreaMargins = false,
  excludeEndContentMargin = false,
  includeContentMargins = true,
  debugMode = false,
  animatedRef,
  centerContent,
  refreshControlProps,
  contentContainerStyle,
  testID
}: IOScrollView) => {
  const alertProps = useStatusAlertProps();
  const theme = useIOTheme();

  /* Navigation */
  const navigation = useNavigation();

  /* Shared Values for `reanimated` */
  const scrollPositionAbsolute =
    useSharedValue(0); /* Scroll position (Absolute) */
  const scrollPositionPercentage =
    useSharedValue(0); /* Scroll position (Relative) */

  /* Total height of actions */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  const insets = useSafeAreaInsets();
  const needSafeAreaMargin = insets.bottom !== 0;

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin =
    !needSafeAreaMargin || excludeSafeAreaMargins
      ? IOVisualCostants.appMarginDefault
      : insets.bottom;

  /* GENERATE EASING GRADIENT
     Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: hexToRgba(HEADER_BG_COLOR, 0) },
      1: { color: HEADER_BG_COLOR }
    },
    easing: Easing.ease,
    extraColorStopsPerTransition: 20
  });

  /* When the secondary action is visible, add extra margin
     to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    actions?.secondary && needSafeAreaMargin ? extraSafeAreaMargin : 0;

  /* Safe background block. Cover at least 85% of the space
     to avoid glitchy elements underneath */
  const safeBackgroundBlockHeight = (bottomMargin + actionBlockHeight) * 0.85;

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight =
    bottomMargin + actionBlockHeight + gradientSafeAreaHeight;

  /* Height of the safe bottom area, applied to the ScrollView:
     Actions + Content end margin */
  const safeBottomAreaHeight =
    bottomMargin + actionBlockHeight + contentEndMargin;

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      const scrollPosition = contentOffset.y;
      const maxScrollHeight = contentSize.height - layoutMeasurement.height;
      const scrollPercentage = scrollPosition / maxScrollHeight;

      scrollPositionAbsolute.value = scrollPosition;
      scrollPositionPercentage.value = scrollPercentage;
    }
  );

  const opacityTransition = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollPositionPercentage.value,
      [0, gradientOpacityScrollTrigger, 1],
      [1, 1, 0],
      Extrapolation.CLAMP
    )
  }));

  const ignoreSafeAreaMargin = React.useMemo(() => {
    if (alertProps !== undefined) {
      return true;
    }
    return headerConfig?.ignoreSafeAreaMargin;
  }, [headerConfig?.ignoreSafeAreaMargin, alertProps]);

  /* Set custom header with `react-navigation` library using
     `useLayoutEffect` hook */

  useLayoutEffect(() => {
    const scrollValues: IOSCrollViewHeaderScrollValues = {
      contentOffsetY: scrollPositionAbsolute,
      triggerOffset: snapOffset || 0
    };

    if (headerConfig) {
      navigation.setOptions({
        header: () => (
          <HeaderSecondLevel
            {...headerConfig}
            ignoreSafeAreaMargin={ignoreSafeAreaMargin}
            scrollValues={scrollValues}
          />
        ),
        headerTransparent: headerConfig.transparent
      });
    }
  }, [
    headerConfig,
    navigation,
    scrollPositionAbsolute,
    snapOffset,
    ignoreSafeAreaMargin
  ]);

  const RefreshControlComponent = refreshControlProps ? (
    <RefreshControl {...refreshControlProps} />
  ) : undefined;

  return (
    <Fragment>
      <Animated.ScrollView
        ref={animatedRef}
        testID={testID}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        snapToOffsets={
          // If there is a refresh control, don't snap to offsets
          // This is a react-native bug: https://github.com/facebook/react-native/issues/27324
          RefreshControlComponent ? undefined : [0, snapOffset || 0]
        }
        snapToEnd={false}
        decelerationRate="normal"
        refreshControl={RefreshControlComponent}
        centerContent={centerContent}
        contentContainerStyle={[
          {
            paddingBottom: excludeEndContentMargin
              ? 0
              : actions
              ? safeBottomAreaHeight
              : bottomMargin + contentEndMargin,
            paddingHorizontal: includeContentMargins
              ? IOVisualCostants.appMarginDefault
              : 0,
            ...contentContainerStyle
          },
          /* Apply the same logic used in the
          `OperationResultScreenContent` component */
          centerContent ? styles.centerContentWrapper : {}
        ]}
      >
        {children}
      </Animated.ScrollView>
      {actions && (
        <View
          style={[
            styles.gradientBottomActions,
            {
              height: gradientAreaHeight,
              paddingBottom: bottomMargin
            }
          ]}
          pointerEvents="box-none"
          {...(testID && { testID: `${testID}-actions` })}
        >
          <Animated.View
            style={[
              styles.gradientContainer,
              debugMode && {
                backgroundColor: hexToRgba(IOColors["error-500"], 0.15)
              }
            ]}
            pointerEvents="none"
          >
            <Animated.View
              style={[
                opacityTransition,
                debugMode && {
                  borderTopColor: IOColors["error-500"],
                  borderTopWidth: 1,
                  backgroundColor: hexToRgba(IOColors["error-500"], 0.4)
                }
              ]}
            >
              <LinearGradient
                style={{
                  height: gradientAreaHeight - safeBackgroundBlockHeight
                }}
                locations={locations}
                colors={colors}
              />
            </Animated.View>

            {/* Safe background block. It's added because when you swipe up
                quickly, the content below is visible for about 100ms. Without this
                block, the content appears glitchy. */}
            <View
              style={{
                bottom: 0,
                height: safeBackgroundBlockHeight,
                backgroundColor: HEADER_BG_COLOR
              }}
            />
          </Animated.View>
          <View
            style={styles.buttonContainer}
            onLayout={getActionBlockHeight}
            pointerEvents="box-none"
          >
            {renderActionButtons(actions, extraBottomMargin)}
          </View>
        </View>
      )}
    </Fragment>
  );
};

const renderActionButtons = (
  actions: IOScrollViewActions,
  extraBottomMargin: number
) => {
  const {
    type,
    primary: primaryAction,
    secondary: secondaryAction,
    tertiary: tertiaryAction
  } = actions;

  return (
    <>
      {primaryAction && <ButtonSolid fullWidth {...primaryAction} />}

      {type === "TwoButtons" && (
        <View
          style={{
            alignSelf: "center",
            marginBottom: extraBottomMargin
          }}
        >
          <VSpacer size={spaceBetweenActionAndLink} />
          <ButtonLink
            color="primary"
            {...(secondaryAction as ComponentProps<typeof ButtonLink>)}
          />
        </View>
      )}

      {type === "ThreeButtons" && (
        <Fragment>
          <VSpacer size={spaceBetweenActions} />
          <ButtonOutline fullWidth color="primary" {...secondaryAction} />

          <View
            style={{
              alignSelf: "center",
              marginBottom: extraBottomMargin
            }}
          >
            <VSpacer size={spaceBetweenActionAndLink} />
            <ButtonLink color="primary" {...tertiaryAction} />
          </View>
        </Fragment>
      )}
    </>
  );
};
