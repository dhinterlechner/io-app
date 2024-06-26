import { formatNumberCentsToAmount } from "../utils/stringBuilder";
import I18n from "../i18n";
import {
  e2ePinChar1,
  e2ePinChar2,
  e2ePinChar3,
  e2ePinChar4,
  e2ePinChar5,
  e2ePinChar6,
  e2eWaitRenderTimeout
} from "./config";

/**
 * Complete the login with SPID
 */
export const loginWithSPID = async () => {
  const loginButtonId = "landing-button-login-spid";
  await waitFor(element(by.id(loginButtonId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await element(by.id(loginButtonId)).tap();

  const posteIdpButtonId = "idp-posteid-button";
  await waitFor(element(by.id(posteIdpButtonId)))
    .toBeVisible()
    .whileElement(by.id("idps-grid"))
    .scroll(50, "down")
    .catch(async _ => {
      await waitFor(element(by.id(posteIdpButtonId)))
        .toBeVisible()
        .withTimeout(e2eWaitRenderTimeout);
    });

  await element(by.id(posteIdpButtonId)).tap();

  // the webview returned by the server has 250ms timeout and reloads automagically

  const shareDataComponentTitleId = "share-data-component-title";
  await waitFor(element(by.id(shareDataComponentTitleId)))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  const shareDataRightButtonId = "share-data-confirm-button";
  await element(by.id(shareDataRightButtonId)).tap();

  await waitFor(element(by.id("pin-creation-screen")))
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);

  await createE2EPin();
  await confirmE2EPin();

  const confirmButton = element(by.id("not-enrolled-biometric-confirm"));
  await waitFor(confirmButton).toBeVisible().withTimeout(e2eWaitRenderTimeout);
  await confirmButton.tap();
};

/**
 * This utility should be used during the authentication
 * step in the pin screen. It will leverage the IO Pinpad
 * to insert the pin.
 */
export const insertE2EPin = async () => {
  await element(by.text(e2ePinChar1)).tap();
  await element(by.text(e2ePinChar6)).tap();
  await element(by.text(e2ePinChar2)).tap();
  await element(by.text(e2ePinChar5)).tap();
  await element(by.text(e2ePinChar3)).tap();
  await element(by.text(e2ePinChar4)).tap();
};

/**
 * This utility should be used during the onboarding in the
 * pin creation screen, or in the same screen in the Profile section.
 * It will fill the two inputs with a pin and submit the form also
 * trying to insert wrong data during the process.
 */
export const createE2EPin = insertE2EPin;
export const confirmE2EPin = insertE2EPin;

/**
 * Ensures that the login with spid and the unlock code has been inserted
 */
export const ensureLoggedIn = async () => {
  try {
    const identificationModalBodyId = "identification-modal-body";
    await waitFor(element(by.id(identificationModalBodyId)))
      .toBeVisible()
      .withTimeout(e2eWaitRenderTimeout);
    await insertE2EPin();
  } catch {
    await loginWithSPID();
  }
};

export const closeKeyboard = async () => {
  // Sometimes the device ignores the locale set by the detox setup
  // In such case we can try to close the keyboard using the english translation
  try {
    await element(by.label("Fine")).atIndex(0).tap();
  } catch (e) {
    await element(by.label("Done")).atIndex(0).tap();
  }
};

export const openPaymentFromMessage = async () => {
  const messageWithPayment = element(
    by.id(`MessageListItem_00000000000000000000000019`)
  );
  await waitFor(messageWithPayment)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await messageWithPayment.tap();

  const seeNoticeButton = element(by.text(I18n.t("messages.cta.seeNotice")));
  await waitFor(seeNoticeButton)
    .toBeVisible()
    .withTimeout(e2eWaitRenderTimeout);
  await seeNoticeButton.tap();
};

export const completePaymentFlow = async () => {
  await waitFor(element(by.text(I18n.t("wallet.continue"))))
    .toExist()
    .withTimeout(e2eWaitRenderTimeout);
  await element(by.text(I18n.t("wallet.continue"))).tap();

  const matchConfirmPayment = by.text(
    `${I18n.t("wallet.ConfirmPayment.pay")} ${formatNumberCentsToAmount(
      2322,
      true
    )}`
  );
  await waitFor(element(matchConfirmPayment))
    .toExist()
    .withTimeout(e2eWaitRenderTimeout);
  await element(matchConfirmPayment).tap();

  await waitFor(
    element(
      by.text(
        I18n.t("payment.paidConfirm", {
          amount: formatNumberCentsToAmount(2322, true)
        })
      )
    )
  )
    .toExist()
    .withTimeout(e2eWaitRenderTimeout);

  await element(by.text(I18n.t("wallet.outcomeMessage.cta.close"))).tap();
};
