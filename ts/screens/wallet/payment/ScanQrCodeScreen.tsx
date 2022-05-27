/**
 * The screen allows to identify a transaction by the QR code on the analogic notice
 */
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { NavigationEvents } from "@react-navigation/compat";
import { head } from "fp-ts/lib/Array";
import { fromNullable, isSome } from "fp-ts/lib/Option";
import { ITuple2 } from "italia-ts-commons/lib/tuples";
import { Text, View } from "native-base";
import * as React from "react";
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Vibration
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { ImageLibraryOptions } from "react-native-image-picker/src/types";
import * as ReaderQR from "react-native-lewin-qrcode";
import { connect } from "react-redux";
import {
  BarcodeCamera,
  ScannedBarcode
} from "../../../components/BarcodeCamera";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { CameraMarker } from "../../../components/wallet/CameraMarker";
import { cancelButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../i18n";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../../navigation/params/AppParamsList";
import {
  navigateToPaymentManualDataInsertion,
  navigateToPaymentTransactionSummaryScreen,
  navigateToWalletHome
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import { GlobalState } from "../../../store/reducers/types";
import { barcodesScannerConfigSelector } from "../../../store/reducers/backendStatus";
import customVariables, {
  VIBRATION_BARCODE_SCANNED_DURATION
} from "../../../theme/variables";
import { ComponentProps } from "../../../types/react";
import { openAppSettings } from "../../../utils/appSettings";
import { AsyncAlert } from "../../../utils/asyncAlert";
import {
  decodePagoPaQrCode,
  decodePosteDataMatrix
} from "../../../utils/payment";
import { isAndroid } from "../../../utils/platform";
import { showToast } from "../../../utils/showToast";
import { mixpanelTrack } from "../../../mixpanel";

type Props = IOStackNavigationRouteProps<AppParamsList> &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = {
  scanningState: ComponentProps<typeof CameraMarker>["state"];
  isFocused: boolean;
  // The scanner package automatically asks for android permission, but we have to display before an alert with
  // the rationale
  permissionRationaleDisplayed: boolean;
};

const screenWidth = Dimensions.get("screen").width;
const cameraTextOverlapping = 20;

const styles = StyleSheet.create({
  padded: {
    paddingRight: customVariables.contentPadding,
    paddingLeft: customVariables.contentPadding
  },

  white: {
    backgroundColor: customVariables.brandPrimaryInverted
  },

  bottomText: {
    paddingTop: cameraTextOverlapping
  },

  content: {
    backgroundColor: customVariables.colorWhite,
    marginTop: -cameraTextOverlapping,
    zIndex: 1
  },

  cameraContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "transparent"
  },

  button: {
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: -cameraTextOverlapping,
    width: screenWidth - customVariables.contentPadding * 2,
    backgroundColor: customVariables.colorWhite,
    zIndex: 999
  },

  camera: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    width: screenWidth
  }
});

/**
 * Delay for reactivating the QR scanner after a scan
 */
const QRCODE_SCANNER_REACTIVATION_TIME_MS = 5000;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.QRtoPay.contextualHelpTitle",
  body: "wallet.QRtoPay.contextualHelpContent"
};
class ScanQrCodeScreen extends React.Component<Props, State> {
  private scannerReactivateTimeoutHandler?: number;
  private goBack = () => this.props.navigation.goBack();

  /**
   * Handles valid pagoPA QR codes
   */
  private onValidQrCode = (data: ITuple2<RptId, AmountInEuroCents>) => {
    this.props.runPaymentTransactionSummarySaga(data.e1, data.e2);
  };

  /**
   * Handles invalid pagoPA QR codes
   */
  private onInvalidQrCode = () => {
    if (this.state.scanningState === "INVALID") {
      return;
    }

    showToast(I18n.t("wallet.QRtoPay.wrongQrCode"), "danger");

    this.setState({
      scanningState: "INVALID"
    });

    // eslint-disable-next-line
    this.scannerReactivateTimeoutHandler = setTimeout(() => {
      // eslint-disable-next-line
      this.scannerReactivateTimeoutHandler = undefined;

      this.setState({
        scanningState: "SCANNING"
      });
    }, QRCODE_SCANNER_REACTIVATION_TIME_MS);
  };

  /**
   * Gets called by the QR code reader on new QR code reads
   */
  private onQrCodeData = (data: string) => {
    const resultOrError = decodePagoPaQrCode(data);
    resultOrError.foldL<void>(this.onInvalidQrCode, this.onValidQrCode);
  };

  private onDataMatrixData = (data: string) => {
    const {
      barcodesScannerConfig: { dataMatrixPosteEnabled }
    } = this.props;

    if (dataMatrixPosteEnabled) {
      const maybePosteDataMatrix = decodePosteDataMatrix(data);

      return maybePosteDataMatrix.foldL<void>(
        () => {
          if (this.state.scanningState !== "INVALID") {
            void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_FAILURE");
          }

          this.onInvalidQrCode();
        },
        data => {
          void mixpanelTrack("WALLET_SCAN_POSTE_DATAMATRIX_SUCCESS");
          this.onValidQrCode(data);
        }
      );
    }
  };

  private onShowImagePicker = async () => {
    // on Android we have to show a prominent disclosure on how we use READ_EXTERNAL_STORAGE permission
    // see https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/444727486/2021-11-18+Android#2021-12-08
    if (isAndroid) {
      await AsyncAlert(
        I18n.t("wallet.QRtoPay.readStorageDisclosure.title"),
        I18n.t("wallet.QRtoPay.readStorageDisclosure.message"),
        [
          {
            text: I18n.t("global.buttons.choose"),
            style: "default"
          }
        ]
      );
    }
    this.showImagePicker();
  };

  private handleBarcodeScanned = (barcode: ScannedBarcode) => {
    if (this.state.scanningState === "SCANNING") {
      // Execute an haptic feedback
      Vibration.vibrate(VIBRATION_BARCODE_SCANNED_DURATION);
    }

    switch (barcode.format) {
      case "QRCODE":
        this.onQrCodeData(barcode.value);
        break;

      case "DATA_MATRIX":
        this.onDataMatrixData(barcode.value);
        break;
    }
  };

  /**
   * Start image chooser
   */
  private showImagePicker = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo"
    };
    // Open Image Library
    ImagePicker.launchImageLibrary(options, response => {
      // With the current settings the user is allowed to pick only one image
      const maybePickedImage = fromNullable(response.assets).chain(assets =>
        head([...assets])
      );
      if (isSome(maybePickedImage)) {
        ReaderQR.readerQR(maybePickedImage.value.uri)
          .then((data: string) => {
            this.onQrCodeData(data);
          })
          .catch(() => {
            this.onInvalidQrCode();
          });
      } else if (response.errorMessage !== undefined) {
        // Alert to invite user to enable the permissions
        Alert.alert(
          I18n.t("wallet.QRtoPay.settingsAlert.title"),
          I18n.t("wallet.QRtoPay.settingsAlert.message"),
          [
            {
              text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.cancel"),
              style: "cancel"
            },
            {
              text: I18n.t("wallet.QRtoPay.settingsAlert.buttonText.settings"),
              onPress: openAppSettings
            }
          ],
          { cancelable: false }
        );
      } // else if the user has not selected a file, do nothing
    });
  };

  public constructor(props: Props) {
    super(props);
    this.state = {
      scanningState: "SCANNING",
      isFocused: false,
      permissionRationaleDisplayed: Platform.OS !== "android"
    };
  }

  public componentWillUnmount() {
    if (this.scannerReactivateTimeoutHandler) {
      // cancel the QR scanner reactivation before unmounting the component
      clearTimeout(this.scannerReactivateTimeoutHandler);
    }
  }

  public async componentDidMount() {
    if (Platform.OS !== "android") {
      return;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    if (!hasPermission) {
      await AsyncAlert(
        I18n.t("permissionRationale.camera.title"),
        I18n.t("permissionRationale.camera.message"),
        [
          {
            text: I18n.t("global.buttons.choose"),
            style: "default"
          }
        ]
      );
    }
    this.setState({ permissionRationaleDisplayed: true });
  }

  private handleWillFocus = () => this.setState({ isFocused: true });

  private handleWillBlur = () => this.setState({ isFocused: false });

  public render(): React.ReactNode {
    const primaryButtonProps = {
      buttonFontSize: customVariables.btnFontSize - 1,
      block: true,
      primary: true,
      onPress: this.props.navigateToPaymentManualDataInsertion,
      title: I18n.t("wallet.QRtoPay.setManually")
    };

    return (
      <BaseScreenComponent
        headerTitle={I18n.t("wallet.QRtoPay.byCameraTitle")}
        goBack={this.goBack}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet"]}
      >
        <NavigationEvents
          onWillFocus={this.handleWillFocus}
          onWillBlur={this.handleWillBlur}
        />
        <SafeAreaView style={IOStyles.flex}>
          <FocusAwareStatusBar
            barStyle={"dark-content"}
            backgroundColor={customVariables.colorWhite}
          />
          <ScrollView bounces={false}>
            <BarcodeCamera
              onBarcodeScanned={this.handleBarcodeScanned}
              disabled={!this.state.isFocused}
              marker={
                <CameraMarker
                  screenWidth={screenWidth}
                  state={this.state.scanningState}
                />
              }
            />

            <View>
              <ButtonDefaultOpacity
                onPress={this.onShowImagePicker}
                style={styles.button}
                bordered={true}
              >
                <Text>{I18n.t("wallet.QRtoPay.chooser")}</Text>
              </ButtonDefaultOpacity>
              <View style={styles.content}>
                <View spacer={true} />
                <Text style={[styles.padded, styles.bottomText]}>
                  {I18n.t("wallet.QRtoPay.cameraUsageInfo")}
                </Text>
                <View spacer={true} extralarge={true} />
              </View>
            </View>
          </ScrollView>
          <FooterWithButtons
            type="TwoButtonsInlineThird"
            leftButton={cancelButtonProps(
              () => this.props.navigation.goBack(),
              I18n.t("global.buttons.cancel")
            )}
            rightButton={primaryButtonProps}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  barcodesScannerConfig: barcodesScannerConfigSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToWalletHome: () => navigateToWalletHome(),
  navigateToPaymentManualDataInsertion: () =>
    navigateToPaymentManualDataInsertion(),
  runPaymentTransactionSummarySaga: (
    rptId: RptId,
    initialAmount: AmountInEuroCents
  ) => {
    dispatch(paymentInitializeState());

    navigateToPaymentTransactionSummaryScreen({
      rptId,
      initialAmount,
      paymentStartOrigin: "qrcode_scan"
    });
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ScanQrCodeScreen);
