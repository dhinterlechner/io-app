import {
  ContentWrapper,
  makeFontStyleObject,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { getThemeColorByCredentialType } from "../../common/utils/itwStyleUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwPresentationCredentialCard } from "./ItwPresentationCredentialCard";

type ItwPresentationDetailsHeaderProps = { credential: StoredCredential };

/**
 * Credentials that should display a card
 */
const credentialsWithCard: ReadonlyArray<string> = [
  CredentialType.PID,
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD
];

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const ItwPresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { isExperimental } = useIOExperimentalDesign();

  const { backgroundColor, textColor, statusBarStyle } =
    getThemeColorByCredentialType(credential.credentialType as CredentialType);

  const headerContent = React.useMemo(() => {
    if (credentialsWithCard.includes(credential.credentialType)) {
      return <ItwPresentationCredentialCard credential={credential} />;
    }

    return (
      <View style={[styles.header, { backgroundColor }]}>
        <ContentWrapper>
          <Text
            style={[
              isExperimental
                ? styles.headerLabelExperimental
                : styles.headerLabel,
              { color: textColor }
            ]}
            accessibilityRole="header"
          >
            {getCredentialNameFromType(credential.credentialType)}
          </Text>
        </ContentWrapper>
      </View>
    );
  }, [credential, backgroundColor, textColor, isExperimental]);

  return (
    <View>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      {headerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: -300,
    paddingTop: 300,
    justifyContent: "flex-end",
    paddingBottom: 24
  },
  headerLabel: {
    ...makeFontStyleObject(26, "TitilliumSansPro", 30, "Semibold")
  },
  headerLabelExperimental: {
    ...makeFontStyleObject(26, "Titillio", 30, "Semibold")
  }
});

const MemoizedItwPresentationDetailsHeader = React.memo(
  ItwPresentationDetailsHeader
);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };
