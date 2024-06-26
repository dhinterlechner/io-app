import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useLinkTo } from "@react-navigation/native";
import { IOVisualCostants, VSpacer } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { logosForService } from "../../../../utils/services";
import { CTA, CTAS } from "../../../messages/types/MessageCTA";
import {
  getServiceCTA,
  handleCtaAction
} from "../../../messages/utils/messages";
import { useFirstRender } from "../../common/hooks/useFirstRender";
import { ServicesParamsList } from "../../common/navigation/params";
import {
  CardWithMarkdownContent,
  CardWithMarkdownContentSkeleton
} from "../components/CardWithMarkdownContent";
import { ServiceDetailsFailure } from "../components/ServiceDetailsFailure";
import { ServiceDetailsMetadata } from "../components/ServiceDetailsMetadata";
import { ServiceDetailsPreferences } from "../components/ServiceDetailsPreferences";
import {
  ServiceActionsProps,
  ServiceDetailsScreenComponent
} from "../components/ServiceDetailsScreenComponent";
import { ServiceDetailsTosAndPrivacy } from "../components/ServiceDetailsTosAndPrivacy";
import { loadServiceDetail } from "../store/actions/details";
import { loadServicePreference } from "../store/actions/preference";
import {
  isErrorServiceByIdSelector,
  isLoadingServiceByIdSelector,
  serviceByIdSelector,
  serviceMetadataByIdSelector,
  serviceMetadataInfoSelector
} from "../store/reducers/servicesById";
import { ServiceMetadataInfo } from "../types/ServiceMetadataInfo";
import { ServicesHeaderSection } from "../../common/components/ServicesHeaderSection";

export type ServiceDetailsScreenRouteParams = {
  serviceId: ServiceId;
  // if true the service should be activated automatically
  // as soon as the screen is shown (used for custom activation
  // flows like PN)
  activate?: boolean;
};

type ServiceDetailsScreenProps = IOStackNavigationRouteProps<
  ServicesParamsList,
  "SERVICE_DETAIL"
>;

const headerPaddingBottom: number = 138;

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: -headerPaddingBottom,
    minHeight: headerPaddingBottom,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export const ServiceDetailsScreen = ({ route }: ServiceDetailsScreenProps) => {
  const { serviceId, activate } = route.params;

  const linkTo = useLinkTo();
  const dispatch = useIODispatch();
  const isFirstRender = useFirstRender();

  const service = useIOSelector(state => serviceByIdSelector(state, serviceId));

  const isLoadingService = useIOSelector(state =>
    isLoadingServiceByIdSelector(state, serviceId)
  );

  const isErrorService = useIOSelector(state =>
    isErrorServiceByIdSelector(state, serviceId)
  );

  const serviceMetadata = useIOSelector(state =>
    serviceMetadataByIdSelector(state, serviceId)
  );

  const serviceMetadataInfo = useIOSelector(state =>
    serviceMetadataInfoSelector(state, serviceId)
  );

  const serviceCtas = useMemo(
    () => pipe(serviceMetadata, getServiceCTA, O.toUndefined),
    [serviceMetadata]
  );

  useEffect(() => {
    dispatch(loadServiceDetail.request(serviceId));
  }, [dispatch, serviceId]);

  useFocusEffect(
    useCallback(() => {
      dispatch(loadServicePreference.request(serviceId));
    }, [serviceId, dispatch])
  );

  if (isErrorService) {
    return <ServiceDetailsFailure serviceId={serviceId} />;
  }

  if (isFirstRender || isLoadingService) {
    return (
      <ServiceDetailsScreenComponent>
        <ServicesHeaderSection
          extraBottomPadding={headerPaddingBottom}
          isLoading={true}
        />
        <View style={styles.cardContainer}>
          <CardWithMarkdownContentSkeleton />
        </View>
      </ServiceDetailsScreenComponent>
    );
  }

  if (!service) {
    return null;
  }

  const handlePressCta = (cta: CTA) => handleCtaAction(cta, linkTo);

  const getActionsProps = (
    ctas?: CTAS,
    serviceMetadataInfo?: ServiceMetadataInfo
  ): ServiceActionsProps | undefined => {
    const customSpecialFlow = serviceMetadataInfo?.customSpecialFlow;
    const isSpecialService = serviceMetadataInfo?.isSpecialService ?? false;

    if (isSpecialService && ctas?.cta_1 && ctas.cta_2) {
      const { cta_1, cta_2 } = ctas;

      return {
        type: "TwoCtasWithCustomFlow",
        primaryActionProps: {
          serviceId,
          activate,
          customSpecialFlowOpt: customSpecialFlow
        },
        secondaryActionProps: {
          label: cta_1.text,
          accessibilityLabel: cta_1.text,
          onPress: () => handlePressCta(cta_1)
        },
        tertiaryActionProps: {
          label: cta_2.text,
          accessibilityLabel: cta_2.text,
          onPress: () => handlePressCta(cta_2)
        }
      };
    }

    if (isSpecialService && ctas?.cta_1) {
      const { cta_1 } = ctas;

      return {
        type: "SingleCtaWithCustomFlow",
        primaryActionProps: {
          serviceId,
          activate,
          customSpecialFlowOpt: customSpecialFlow
        },
        secondaryActionProps: {
          label: cta_1.text,
          accessibilityLabel: cta_1.text,
          onPress: () => handlePressCta(cta_1)
        }
      };
    }

    if (ctas?.cta_1 && ctas?.cta_2) {
      const { cta_1, cta_2 } = ctas;

      return {
        type: "TwoCtas",
        primaryActionProps: {
          label: cta_1.text,
          accessibilityLabel: cta_1.text,
          onPress: () => handlePressCta(cta_1)
        },
        secondaryActionProps: {
          label: cta_2.text,
          accessibilityLabel: cta_2.text,
          onPress: () => handlePressCta(cta_2)
        }
      };
    }

    if (ctas?.cta_1) {
      return {
        type: "SingleCta",
        primaryActionProps: {
          label: ctas.cta_1.text,
          accessibilityLabel: ctas.cta_1.text,
          onPress: () => handlePressCta(ctas.cta_1)
        }
      };
    }

    if (isSpecialService) {
      return {
        type: "SingleCtaCustomFlow",
        primaryActionProps: {
          serviceId,
          activate,
          customSpecialFlowOpt: customSpecialFlow
        }
      };
    }

    return undefined;
  };

  const {
    organization_name,
    organization_fiscal_code,
    service_id,
    service_name,
    available_notification_channels,
    service_metadata
  } = service;

  return (
    <ServiceDetailsScreenComponent
      actionsProps={getActionsProps(
        serviceCtas,
        serviceMetadataInfo as ServiceMetadataInfo
      )}
      title={service_name}
    >
      <ServicesHeaderSection
        extraBottomPadding={headerPaddingBottom}
        logoUri={logosForService(service)}
        title={service_name}
        subTitle={organization_name}
      />
      {service_metadata?.description && (
        <View style={styles.cardContainer}>
          <CardWithMarkdownContent content={service_metadata.description} />
        </View>
      )}

      <ServiceDetailsTosAndPrivacy serviceId={service_id} />

      <VSpacer size={40} />
      <ServiceDetailsPreferences
        serviceId={service_id}
        availableChannels={available_notification_channels}
      />

      <VSpacer size={40} />
      <ServiceDetailsMetadata
        organizationFiscalCode={organization_fiscal_code}
        serviceId={service_id}
      />
    </ServiceDetailsScreenComponent>
  );
};
