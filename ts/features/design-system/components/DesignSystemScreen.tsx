import * as React from "react";
import { ScrollView, StatusBar, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ContentWrapper,
  IOVisualCostants,
  useIOTheme
} from "@pagopa/io-app-design-system";

type Props = {
  title: string;
  children: React.ReactNode;
  noMargin?: boolean;
};

export const DesignSystemScreen = ({ children, noMargin = false }: Props) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();

  return (
    <>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "default"}
        backgroundColor={theme["appBackground-primary"]}
      />
      <ScrollView
        contentContainerStyle={{
          paddingTop: IOVisualCostants.appMarginDefault,
          paddingBottom: insets.bottom + IOVisualCostants.appMarginDefault
        }}
      >
        {noMargin ? (
          <View>{children}</View>
        ) : (
          <ContentWrapper>{children}</ContentWrapper>
        )}
      </ScrollView>
    </>
  );
};
