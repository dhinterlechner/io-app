import { Errors } from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { call, put, select } from "typed-redux-saga/macro";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { getAttestation } from "../../common/utils/itwAttestationUtils";
import { ensureIntegrityServiceIsReady } from "../../common/utils/itwIntegrityUtils";
import { itwIntegrityKeyTagSelector } from "../../issuance/store/selectors";
import { itwIsWalletInstanceAttestationValidSelector } from "../../walletInstance/store/reducers";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { itwIntegritySetServiceIsReady } from "../../issuance/store/actions";
import { handleWalletInstanceResetSaga } from "./handleWalletInstanceResetSaga";

const {
  isWalletProviderResponseError,
  WalletProviderResponseErrorCodes: Codes
} = Errors;

export function* getAttestationOrResetWalletInstance(integrityKeyTag: string) {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  const isWalletInstanceAttestationValid = yield* select(
    itwIsWalletInstanceAttestationValidSelector
  );

  if (isWalletInstanceAttestationValid) {
    // The Wallet Instance Attestation is present and  has not yet expired
    return;
  }

  // If the Wallet Instance Attestation is not present or it has expired
  // we need to request a new one
  try {
    yield* call(getAttestation, integrityKeyTag, sessionToken);
  } catch (err) {
    if (
      isWalletProviderResponseError(err, Codes.WalletInstanceRevoked) ||
      isWalletProviderResponseError(err, Codes.WalletInstanceNotFound)
    ) {
      yield* call(handleWalletInstanceResetSaga);
    }
  }
}

/**
 * Saga responsible to check whether the wallet instance has not been revoked
 * or deleted. When this happens, the wallet is reset on the users's device.
 */
export function* checkWalletInstanceStateSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  // We start the warming up process of the integrity service on Android
  try {
    const integrityServiceReadyResult: boolean = yield* call(
      ensureIntegrityServiceIsReady
    );
    yield* put(itwIntegritySetServiceIsReady(integrityServiceReadyResult));

    const isItwOperationalOrValid = yield* select(
      itwLifecycleIsOperationalOrValid
    );
    const integrityKeyTag = yield* select(itwIntegrityKeyTagSelector);

    // Only operational or valid wallet instances can be revoked.
    if (isItwOperationalOrValid && O.isSome(integrityKeyTag)) {
      yield* call(getAttestationOrResetWalletInstance, integrityKeyTag.value);
    }
  } catch (e) {
    // Ignore the error, the integrity service is not available and an error will occur if the wallet requests an attestation
  }
}
