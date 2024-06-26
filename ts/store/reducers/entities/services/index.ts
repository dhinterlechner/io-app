/**
 * Services reducer
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { ServiceScopeEnum } from "../../../../../definitions/backend/ServiceScope";
import servicePreferenceReducer, {
  ServicePreferenceState
} from "../../../../features/services/details/store/reducers/servicePreference";
import servicesByIdReducer, {
  servicesByIdSelector,
  ServicesByIdState
} from "../../../../features/services/details/store/reducers/servicesById";
import { isDefined } from "../../../../utils/guards";
import { isVisibleService } from "../../../../utils/services";
import { Action } from "../../../actions/types";
import { GlobalState } from "../../types";
import { userMetadataSelector } from "../../userMetadata";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../organizations/organizationsByFiscalCodeReducer";
import {
  firstLoadingReducer,
  FirstLoadingState,
  isFirstVisibleServiceLoadCompletedSelector
} from "./firstServicesLoading";
import readServicesByIdReducer, {
  readServicesByIdSelector,
  ReadStateByServicesId
} from "./readStateByServiceId";
import {
  serviceIdsByOrganizationFiscalCodeReducer,
  ServiceIdsByOrganizationFiscalCodeState
} from "./servicesByOrganizationFiscalCode";
import {
  visibleServicesReducer,
  visibleServicesSelector,
  VisibleServicesState
} from "./visibleServices";

export type ServicesState = Readonly<{
  // Section to hold the preference for services
  servicePreference: ServicePreferenceState;
  byId: ServicesByIdState;
  byOrgFiscalCode: ServiceIdsByOrganizationFiscalCodeState;
  visible: VisibleServicesState;
  readState: ReadStateByServicesId;
  firstLoading: FirstLoadingState;
}>;

export type ServicesSectionState = Readonly<{
  organizationName: string;
  organizationFiscalCode: string;
  data: ReadonlyArray<pot.Pot<ServicePublic, Error>>;
}>;

const reducer = combineReducers<ServicesState, Action>({
  servicePreference: servicePreferenceReducer,
  byId: servicesByIdReducer,
  byOrgFiscalCode: serviceIdsByOrganizationFiscalCodeReducer,
  visible: visibleServicesReducer,
  readState: readServicesByIdReducer,
  firstLoading: firstLoadingReducer
});

/**
 * Selectors
 */

export const servicesSelector = (state: GlobalState) => state.entities.services;

/**
 * The function returns:
 * - pot.none if visibleServices is not loaded or the related services load is not yet started
 * - pot.noneLoading if visibleServices or at least one visible service is loading
 * - pot.noneError if visibleServices or at least one visible service load fails
 * - pot.some if both visible services and all services load successfully
 * @param visibleServices - list of visible services
 * @param services - collection of services related data indexed with respect to the services id
 *                   (applied for entities.services.byId state)
 */
function getServicesLoadState<T>(
  visibleServices: VisibleServicesState,
  services: Readonly<{
    [key: string]: pot.Pot<T, Error> | undefined;
  }>
): pot.Pot<void, Error> {
  if (pot.isSome(visibleServices) && Object.keys(services).length > 0) {
    const visibleServicesById = visibleServices.value.map(
      service => services[service.service_id]
    );

    // check if there is at least one service in loading state
    const areServicesLoading =
      pot.isLoading(visibleServices) ||
      visibleServicesById.some(
        vs => vs === undefined || (pot.isNone(vs) && pot.isLoading(vs))
      );

    // check if there is at least one service in error state
    const isServicesLoadFailed =
      pot.isError(visibleServices) ||
      visibleServicesById.some(
        service => service !== undefined && pot.isError(service)
      );

    if (areServicesLoading) {
      return pot.noneLoading;
    } else if (isServicesLoadFailed) {
      return pot.noneError(Error(`Unable to load one or more services`));
    } else {
      return pot.some(undefined);
    }
  }

  // If visibleServices is none
  if (pot.isLoading(visibleServices)) {
    return pot.noneLoading;
  } else if (pot.isError(visibleServices)) {
    return pot.noneError(Error("Unable to load visible services"));
  } else {
    return pot.none;
  }
}

// A selector to monitor the state of the service detail loading
export const visibleServicesDetailLoadStateSelector = createSelector(
  [servicesByIdSelector, visibleServicesSelector],
  (servicesById, visibleServices) =>
    getServicesLoadState<ServicePublic>(visibleServices, servicesById)
);

/**
 * A selector to get the organizations selected by the user as areas of interests
 * which provide visible services
 */
export const organizationsOfInterestSelector = createSelector(
  [userMetadataSelector, servicesSelector],
  (potUserMetadata, services) => {
    const visibleServices = new Set<string>(
      pot.getOrElse(services.visible, []).map(_ => _.service_id)
    );

    // If the user never select areas of interest, return an undefined object
    return pot.toUndefined(
      pot.map(potUserMetadata, _ =>
        // filter organization by selecting those ones having
        // at least 1 visible service inside
        _.metadata.organizationsOfInterest
          ? _.metadata.organizationsOfInterest.filter(org => {
              const organizationServices = services.byOrgFiscalCode[org] || [];
              return organizationServices.some(serviceId =>
                visibleServices.has(serviceId)
              );
            })
          : []
      )
    );
  }
);

/**
 * Functions and selectors to get services organized in sections
 */

// Check if the passed service is local or national through data included into serviceByScope store item.
// If the scope parameter is expressed, the corresponding item is not included into the section if:
// -  the scope parameter is different to the service scope
// -  service detail or serviceByScope loading fails
const isInScope = (
  service: pot.Pot<ServicePublic, Error>,
  scope?: ServiceScopeEnum
) => {
  if (scope === undefined) {
    return true;
  }

  // if service is in Error, the item is not included into the section
  return pot.getOrElse(
    pot.map(service, s => s.service_metadata?.scope === scope),
    false
  );
};

// NOTE: this is a workaround not a solution
// since a service can change its organization fiscal code we could have
// obsolete data in the store: byOrgFiscalCode could have services that don't belong to organization anymore
// this cleaning its a workaround, this should be fixed on data loading and not when data are loaded
// see https://www.pivotaltracker.com/story/show/172316333
/**
 * return true if service belongs to the given organization fiscal code
 * @param service
 * @param organizationFiscalCode
 */
const belongsToOrganization = (
  service: pot.Pot<ServicePublic, Error>,
  organizationsFiscalCode: ReadonlyArray<string>
) =>
  pot.getOrElse(
    pot.map(
      service,
      s => organizationsFiscalCode.indexOf(s.organization_fiscal_code) !== -1
    ),
    false
  );

/**
 * A generalized function to generate sections of organizations including the available services for each organization
 * optional input:
 * - scope: if undefined, all available organizations are included. If expressed, it requires service metadata being loaded
 * - organizationsFiscalCodesSelected: if provided, sections will include only the passed organizations
 */
const getServices = (
  services: ServicesState,
  organizations: OrganizationNamesByFiscalCodeState,
  scope?: ServiceScopeEnum,
  selectedOrganizationsFiscalCodes?: ReadonlyArray<string>
) => {
  const organizationsFiscalCodes =
    selectedOrganizationsFiscalCodes === undefined
      ? Object.keys(services.byOrgFiscalCode)
      : selectedOrganizationsFiscalCodes;
  // another workaround to avoid to display same organizations name that have different cf
  // we group services by organization name
  // to avoid duplication we keep in a set all organization fiscal code processed
  const orgFiscalCodeProcessed = new Set<string>();
  return organizationsFiscalCodes
    .map((fiscalCode: string) => {
      const organizationName = organizations[fiscalCode] || fiscalCode;
      const organizationFiscalCode = fiscalCode;
      if (orgFiscalCodeProcessed.has(fiscalCode)) {
        return {
          organizationName,
          organizationFiscalCode,
          data: []
        };
      }

      const orgsFiscalCodes = Object.keys(organizations).filter(cf =>
        pipe(
          organizations[cf],
          O.fromNullable,
          O.fold(
            () => false,
            name => organizationName === name // select all services that belong to organizations having organizationName
          )
        )
      );
      orgsFiscalCodes.forEach(ocf => orgFiscalCodeProcessed.add(ocf));
      const serviceIdsForOrg = orgsFiscalCodes.reduce(
        (acc: ReadonlyArray<string>, curr: string) => [
          ...acc,
          ...(services.byOrgFiscalCode[curr] || [])
        ],
        []
      );

      const data = serviceIdsForOrg
        .map(id => services.byId[id])
        .filter(
          service =>
            isDefined(service) &&
            belongsToOrganization(service, orgsFiscalCodes) && // workaround: see comments above this function definition
            isInScope(service, scope) &&
            isVisibleService(services.visible, service)
        )
        .sort((a, b) =>
          a && pot.isSome(a) && b && pot.isSome(b)
            ? a.value.service_name
                .toLocaleLowerCase()
                .localeCompare(b.value.service_name.toLocaleLowerCase())
            : 0
        );

      return {
        organizationName,
        organizationFiscalCode,
        data
      } as ServicesSectionState;
    })
    .filter(_ => _.data.length > 0)
    .sort((a, b) =>
      a.organizationName
        .toLocaleLowerCase()
        .localeCompare(b.organizationName.toLocaleLowerCase())
    );
};

// A selector providing sections related to national services
export const nationalServicesSectionsSelector = createSelector(
  [servicesSelector, organizationNamesByFiscalCodeSelector],
  (services, organizations) =>
    getServices(services, organizations, ServiceScopeEnum.NATIONAL)
);

// A selector providing sections related to local services
export const localServicesSectionsSelector = createSelector(
  [servicesSelector, organizationNamesByFiscalCodeSelector],
  (services, organizations) =>
    getServices(services, organizations, ServiceScopeEnum.LOCAL)
);

// A selector providing sections related to the organizations selected by the user
export const selectedLocalServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    organizationsOfInterestSelector
  ],
  (services, organizations, selectedOrganizations) =>
    getServices(services, organizations, undefined, selectedOrganizations)
);

// A selector providing sections related to:
// - all national services
// - local services not included into the user areas of interest
export const notSelectedServicesSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    organizationsOfInterestSelector
  ],
  (services, organizations, selectedOrganizations) => {
    const notSelectedOrganizations = pipe(
      organizations,
      O.fromNullable,
      O.map(orgs => {
        // add to organizations all cf of other organizations having the same organization name
        const organizationsWithSameNames = pipe(
          selectedOrganizations,
          O.fromNullable,
          O.map(so =>
            so.reduce((acc, curr) => {
              const orgName = O.fromNullable(orgs[curr]);
              return pipe(
                orgName,
                O.fold(
                  () => acc,
                  on => {
                    if (organizations !== undefined) {
                      const orgsFiscalCodes = Object.keys(organizations).filter(
                        cf =>
                          pipe(
                            organizations[cf],
                            O.fromNullable,
                            O.fold(
                              () => false,
                              name => on === name // select all services that belong to organizations having organizationName
                            )
                          )
                      );
                      orgsFiscalCodes.forEach(ofc => acc.add(ofc));
                    }
                    return acc;
                  }
                )
              );
            }, new Set<string>())
          ),
          O.fold(
            () => [],
            s => Array.from(s)
          )
        );
        return Object.keys(orgs).filter(
          fiscalCode =>
            organizationsWithSameNames &&
            organizationsWithSameNames.indexOf(fiscalCode) === -1
        );
      })
    );

    return getServices(
      services,
      organizations,
      undefined,
      O.toUndefined(notSelectedOrganizations)
    );
  }
);

/**
 *  Get the sum of selected local services + national that are not yet marked as read
 */

export const servicesBadgeValueSelector = createSelector(
  [
    nationalServicesSectionsSelector,
    selectedLocalServicesSectionsSelector,
    readServicesByIdSelector,
    isFirstVisibleServiceLoadCompletedSelector
  ],
  (
    nationalService,
    localService,
    readServicesById,
    isFirstVisibleServiceLoadCompleted
  ) => {
    if (isFirstVisibleServiceLoadCompleted) {
      const servicesSet: Set<ServicesSectionState> = new Set([
        ...nationalService,
        ...localService
      ]);
      return [...servicesSet].reduce(
        (acc: number, service: ServicesSectionState) => {
          const servicesNotRead = service.data.filter(
            data =>
              pot.isSome(data) &&
              readServicesById[data.value.service_id] === undefined
          ).length;
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          return acc + servicesNotRead;
        },
        0
      );
    }
    return 0;
  }
);

export default reducer;
