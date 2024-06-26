import React, { useMemo } from "react";
import { FlatList, View } from "react-native";
import { Body, Divider, IOStyles } from "@pagopa/io-app-design-system";
import {
  useSafeAreaFrame,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import I18n from "../../../../i18n";
import { MessageListCategory } from "../../types/messageListCategory";
import { useIOSelector } from "../../../../store/hooks";
import { messageListForCategorySelector } from "../../store/reducers/allPaginated";
import { UIMessage } from "../../types";
import { messageListItemHeight } from "./homeUtils";
import { WrappedMessageListItem } from "./WrappedMessageListItem";
import { MessageListItemSkeleton } from "./DS/MessageListItemSkeleton";

type MessageListProps = {
  category: MessageListCategory;
};

const topBarHeight = 108;
const bottomTabHeight = 54;

export const MessageList = ({ category }: MessageListProps) => {
  const safeAreaFrame = useSafeAreaFrame();
  const safeAreaInsets = useSafeAreaInsets();
  const messageList = useIOSelector(state =>
    messageListForCategorySelector(state, category)
  );
  const loadingList = useMemo(() => {
    const listHeight =
      safeAreaFrame.height -
      safeAreaInsets.top -
      safeAreaInsets.bottom -
      topBarHeight -
      bottomTabHeight;
    const count = Math.floor(listHeight / messageListItemHeight());
    return [...Array(count).keys()];
  }, [safeAreaFrame.height, safeAreaInsets.top, safeAreaInsets.bottom]);

  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1 }}
      data={(messageList ?? loadingList) as Readonly<Array<number | UIMessage>>}
      ListEmptyComponent={() => (
        <View
          style={[
            IOStyles.flex,
            { justifyContent: "center", alignItems: "center" }
          ]}
        >
          <Body>{`Lista vuota in corso di sviluppo`}</Body>
        </View>
      )}
      ItemSeparatorComponent={messageList ? () => <Divider /> : undefined}
      renderItem={({ item }) => {
        if (typeof item === "number") {
          return (
            <MessageListItemSkeleton
              accessibilityLabel={I18n.t("messages.loading")}
            />
          );
        } else {
          return <WrappedMessageListItem message={item} />;
        }
      }}
    />
  );
};
