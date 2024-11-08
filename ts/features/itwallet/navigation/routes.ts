export const ITW_ROUTES = {
  MAIN: "ITW_MAIN" as const,
  ONBOARDING: "ITW_CARD_ONBOARDING" as const,
  DISCOVERY: {
    INFO: "ITW_DISCOVERY_INFO",
    IPZS_PRIVACY: "ITW_IPZS_PRIVACY",
    ALREADY_ACTIVE_SCREEN: "ITW_ALREADY_ACTIVE_SCREEN"
  } as const,
  IDENTIFICATION: {
    MODE_SELECTION: "ITW_IDENTIFICATION_MODE_SELECTION",
    IDP_SELECTION: "ITW_IDENTIFICATION_IDP_SELECTION",
    CIE: {
      PIN_SCREEN: "ITW_IDENTIFICATION_CIE_PIN_SCREEN",
      CARD_READER_SCREEN: "ITW_IDENTIFICATION_CIE_CARD_READER_SCREEN",
      CONSENT_DATA_USAGE: "ITW_IDENTIFICATION_CIE_CONSENT_DATA_USAGE",
      WRONG_PIN: "ITW_IDENTIFICATION_CIE_WRONG_PIN",
      WRONG_CARD: "ITW_IDENTIFICATION_CIE_WRONG_CARD",
      ACTIVATE_NFC: "ITW_IDENTIFICATION_CIE_ACTIVATE_NFC",
      UNEXPECTED_ERROR: "ITW_IDENTIFICATION_CIE_UNEXPECTED_ERROR",
      CIE_EXPIRED_SCREEN: "ITW_IDENTIFICATION_CIE_EXPIRED_SCREEN"
    }
  } as const,
  ISSUANCE: {
    EID_PREVIEW: "ITW_ISSUANCE_EID_PREVIEW",
    EID_RESULT: "ITW_ISSUANCE_EID_RESULT",
    EID_FAILURE: "ITW_ISSUANCE_EID_FAILURE",
    CREDENTIAL_TRUST_ISSUER: "ITW_ISSUANCE_CREDENTIAL_TRUST_ISSUER",
    CREDENTIAL_PREVIEW: "ITW_ISSUANCE_CREDENTIAL_PREVIEW",
    CREDENTIAL_FAILURE: "ITW_ISSUANCE_CREDENTIAL_FAILURE",
    CREDENTIAL_ASYNC_FLOW_CONTINUATION:
      "ITW_ISSUANCE_CREDENTIAL_ASYNC_FLOW_CONTINUATION"
  } as const,
  PRESENTATION: {
    CREDENTIAL_DETAIL: "ITW_PRESENTATION_CREDENTIAL_DETAIL",
    CREDENTIAL_ATTACHMENT: "ITW_PRESENTATION_CREDENTIAL_ATTACHMENT"
  } as const,
  PLAYGROUNDS: "ITW_PLAYGROUNDS" as const,
  IDENTITY_NOT_MATCHING_SCREEN: "ITW_IDENTITY_NOT_MATCHING_SCREEN" as const,
  WALLET_REVOCATION_SCREEN: "ITW_WALLET_REVOCATION_SCREEN" as const
};
