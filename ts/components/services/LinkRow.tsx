import * as React from "react";
import { StyleSheet } from "react-native";

import { IOToast } from "@pagopa/io-app-design-system";
import { TranslationKeys } from "../../../locales/locales";
import I18n from "../../i18n";
import { openWebUrl } from "../../utils/url";

import { Link } from "../core/typography/Link";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

const styles = StyleSheet.create({
  link: {
    paddingVertical: 16
  }
});

type Props = {
  text: TranslationKeys;
  href: string;
};

const LinkRow = ({ text, href }: Props) => (
  <>
    <Link
      ellipsizeMode={"tail"}
      onPress={() =>
        openWebUrl(href, () => IOToast.error(I18n.t("global.jserror.title")))
      }
      numberOfLines={1}
      style={styles.link}
    >
      {I18n.t(text)}
    </Link>
    <ItemSeparatorComponent noPadded />
  </>
);

export default LinkRow;
