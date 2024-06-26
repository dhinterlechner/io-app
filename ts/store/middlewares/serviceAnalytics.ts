import { getType } from "typesafe-actions";
import { mixpanel } from "../../mixpanel";
import { Action } from "../actions/types";
import { loadServicesDetail, loadVisibleServices } from "../actions/services";
import { loadServiceDetail } from "../../features/services/details/store/actions/details";
import {
  loadServicePreference,
  upsertServicePreference
} from "../../features/services/details/store/actions/preference";

// Isolated tracker for services actions
export const trackServiceAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): void => {
    switch (action.type) {
      case getType(loadServicesDetail):
        return mp.track(action.type, {
          count: action.payload.length
        });
      case getType(loadServiceDetail.failure):
        return mp.track(action.type, {
          reason: action.payload.error.message
        });
      case getType(loadVisibleServices.failure):
        return mp.track(action.type, {
          reason: action.payload.message
        });
      case getType(loadServicePreference.failure):
      case getType(upsertServicePreference.failure):
        return mp.track(action.type, {
          service_id: action.payload.id,
          reason: action.payload
        });
      case getType(loadVisibleServices.request):
      case getType(loadVisibleServices.success):
      case getType(loadServiceDetail.request):
      case getType(loadServiceDetail.success):
      case getType(loadServicePreference.request):
        return mp.track(action.type);
      case getType(upsertServicePreference.request):
        return mp.track(action.type, {
          service_id: action.payload.id
        });
      case getType(loadServicePreference.success):
      case getType(upsertServicePreference.success):
        return mp.track(action.type, {
          service_id: action.payload.id,
          responseStatus: action.payload.kind
        });
    }
  };
