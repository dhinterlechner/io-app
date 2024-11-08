export enum ITW_SCREENVIEW_EVENTS {
  BANNER = "BANNER",
  ITW_INTRO = "ITW_INTRO",
  ITW_ID_METHOD = "ITW_ID_METHOD",
  ITW_SPID_IDP_SELECTION = "ITW_SPID_IDP_SELECTION",
  ITW_CIE_PIN_ENTER = "ITW_CIE_PIN_ENTER",
  ITW_CIE_NFC_ACTIVATION = "ITW_CIE_NFC_ACTIVATION",
  ITW_CIE_CARD_READING = "ITW_CIE_CARD_READING",
  ITW_CARD_READING_SUCCESS = "ITW_CARD_READING_SUCCESS",
  ITW_CREDENTIAL_PREVIEW = "ITW_CREDENTIAL_PREVIEW",
  WALLET = "WALLET",
  WALLET_ADD_LIST_ITEM = "WALLET_ADD_LIST_ITEM",
  ITW_DATA_SHARE = "ITW_DATA_SHARE",
  ITW_CREDENTIAL_DETAIL = "ITW_CREDENTIAL_DETAIL",
  ITW_DEFERRED_ISSUING = "ITW_DEFERRED_ISSUING",
  "ITW_CREDENTIAL_FAC-SIMILE" = "ITW_CREDENTIAL_FAC-SIMILE"
}

export enum ITW_ACTIONS_EVENTS {
  CLOSE_BANNER = "CLOSE_BANNER",
  TAP_BANNER = "TAP_BANNER",
  ITW_TOS = "ITW_TOS",
  ITW_TOS_ACCEPTED = "ITW_TOS_ACCEPTED",
  ITW_ID_START = "ITW_ID_START",
  ITW_ID_METHOD_SELECTED = "ITW_ID_METHOD_SELECTED",
  ITW_SPID_IDP_SELECTED = "ITW_SPID_IDP_SELECTED",
  ITW_CIE_PIN_INFO = "ITW_CIE_PIN_INFO",
  ITW_CIE_PIN_FORGOTTEN = "ITW_CIE_PIN_FORGOTTEN",
  ITW_CIE_PUK_FORGOTTEN = "ITW_CIE_PUK_FORGOTTEN",
  ITW_CIE_NFC_GO_TO_SETTINGS = "ITW_CIE_NFC_GO_TO_SETTINGS",
  ITW_CIE_RETRY_PIN = "ITW_CIE_RETRY_PIN",
  ITW_UX_CONVERSION = "ITW_UX_CONVERSION",
  ITW_ADD_FIRST_CREDENTIAL = "ITW_ADD_FIRST_CREDENTIAL",
  WALLET_ADD_START = "WALLET_ADD_START",
  ITW_KO_STATE_ACTION_SELECTED = "ITW_KO_STATE_ACTION_SELECTED",
  ITW_DATA_SHARE_ACCEPTED = "ITW_DATA_SHARE_ACCEPTED",
  WALLET_ADD = "WALLET_ADD",
  ITW_CREDENTIAL_DELETE = "ITW_CREDENTIAL_DELETE",
  WALLET_CATEGORY_FILTER = "WALLET_CATEGORY_FILTER",
  ITW_CREDENTIAL_SHOW_BACK = "ITW_CREDENTIAL_SHOW_BACK",
  ITW_CREDENTIAL_SHOW_ISSUER = "ITW_CREDENTIAL_SHOW_ISSUER",
  ITW_CREDENTIAL_SHOW_AUTH_SOURCE = "ITW_CREDENTIAL_SHOW_AUTH_SOURCE",
  ITW_CREDENTIAL_SUPPORT = "ITW_CREDENTIAL_SUPPORT",
  "ITW_CREDENTIAL_SHOW_FAC-SIMILE" = "ITW_CREDENTIAL_SHOW_FAC-SIMILE",
  ITW_CREDENTIAL_SHOW_TRUSTMARK = "ITW_CREDENTIAL_SHOW_TRUSTMARK",
  ITW_START_DEACTIVATION = "ITW_START_DEACTIVATION",
  ITW_NEW_ID_RESET = "ITW_NEW_ID_RESET",
  ITW_CREDENTIAL_RENEW_START = "ITW_CREDENTIAL_RENEW_START"
}

export enum ITW_ERRORS_EVENTS {
  ITW_DEVICE_NOT_SUPPORTED = "ITW_DEVICE_NOT_SUPPORTED",
  ITW_CIE_CARD_READING_ERROR = "ITW_CIE_CARD_READING_ERROR",
  ITW_CIE_PIN_ERROR = "ITW_CIE_PIN_ERROR",
  ITW_CIE_PIN_SECOND_ERROR = "ITW_CIE_PIN_SECOND_ERROR",
  ITW_CIE_PIN_LAST_ERROR = "ITW_CIE_PIN_LAST_ERROR",
  ITW_CIE_CARD_VERIFY_FAILURE = "ITW_CIE_CARD_VERIFY_FAILURE",
  ITW_CIE_CARD_READING_FAILURE = "ITW_CIE_CARD_READING_FAILURE",
  ITW_ADD_CREDENTIAL_TIMEOUT = "ITW_ADD_CREDENTIAL_TIMEOUT",
  ITW_ADD_CREDENTIAL_FAILURE = "ITW_ADD_CREDENTIAL_FAILURE",
  ITW_ADD_CREDENTIAL_NOT_ENTITLED_FAILURE = "ITW_ADD_CREDENTIAL_NOT_ENTITLED_FAILURE",
  ITW_ID_NOT_MATCH = "ITW_ID_NOT_MATCH",
  ITW_ID_REQUEST_TIMEOUT = "ITW_ID_REQUEST_TIMEOUT",
  ITW_ID_REQUEST_FAILURE = "ITW_ID_REQUEST_FAILURE",
  ITW_ID_REQUEST_UNEXPECTED_FAILURE = "ITW_ID_REQUEST_UNEXPECTED_FAILURE",
  ITW_LOGIN_ID_NOT_MATCH = "ITW_LOGIN_ID_NOT_MATCH",
  ITW_ALREADY_HAS_CREDENTIAL = "ITW_ALREADY_HAS_CREDENTIAL",
  ITW_ADD_CREDENTIAL_INVALID_STATUS = "ITW_ADD_CREDENTIAL_INVALID_STATUS",
  ITW_ALREADY_ACTIVATED = "ITW_ALREADY_ACTIVATED"
}

export enum ITW_EXIT_EVENTS {
  ITW_USER_EXIT = "ITW_USER_EXIT",
  ITW_BACK_TO_WALLET = "ITW_BACK_TO_WALLET"
}

export enum ITW_TECH_EVENTS {
  ITW_ID_REQUEST = "ITW_ID_REQUEST",
  ITW_ID_REQUEST_SUCCESS = "ITW_ID_REQUEST_SUCCESS"
}

export enum ITW_CONFIRM_EVENTS {
  ITW_UX_SUCCESS = "ITW_UX_SUCCESS",
  ITW_DEACTIVATED = "ITW_DEACTIVATED"
}
