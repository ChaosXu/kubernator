import { put, take } from 'redux-saga/effects';
import store from 'store';

import {
  NotiErrorApi,
} from '../../middleware/notifications';


export const PREFIX = 'k8s';

export const ID = Symbol('ID');
export const URL = Symbol('URL');
export const YAML = Symbol('YAML');

export const GROUP_ID = Symbol('GROUP_ID');
export const RESOURCE_ID = Symbol('RESOURCE_ID');

export const RESOURCE_IDS = Symbol('RESOURCE_IDS');
export const ITEM_IDS = Symbol('ITEM_IDS');

export const IS_READONLY = Symbol('IS_READONLY');
export const IS_LISTABLE = Symbol('IS_LISTABLE');
export const IS_LOADING_CATALOG = Symbol('IS_LOADING_CATALOG');

export const URL_PART_GROUP = Symbol('URL_PART_GROUP');
export const URL_PART_RESOURCE = Symbol('URL_PART_RESOURCE');

export const NO_GROUP = '[nogroup]';
export const NO_NAMESPACE = '[nonamespace]';
export const NO_UID = '[nouid]';

export const UI_THROTTLE = 500;

export async function apiFetch(url, options = {}, parser = 'json') {
  const netResponse = await fetch(url, options);
  if (netResponse.ok) return netResponse[parser]();
  else {
    let apiResponse;

    // parse as text
    try {
      apiResponse = await netResponse.text();
    }
    catch (e) {}

    // parse as json
    try {
      apiResponse = JSON.parse(apiResponse);
    }
    catch (e) {}

    // notify
    throw new NotiErrorApi(apiResponse, netResponse);
  }
}

(async function cacheInit() {
  const version = await apiFetch('/version');
  const buildDate = store.get('version.buildDate');
  if (buildDate !== version.buildDate) {
    store.clearAll();
    store.set('version.buildDate', version.buildDate);
  }
})();

export async function cacheGet(url) {
  let result = store.get(url);
  if (!result) {
    result = await apiFetch(url);
    store.set(url, result);
  }
  return Promise.resolve(result);
}

export function* putTake(actionPut, actionsTake) {
  const $id = Date.now();

  // put
  if (!actionPut.meta) actionPut.meta = {};
  actionPut.meta.$id = $id;
  yield put(actionPut);

  // take
  const [, actionTypeF] = actionsTake;
  let action = { meta: { $id: null }};
  while (action.meta.$id !== $id) {
    action = yield take(actionsTake);
  }

  //
  return action.type === actionTypeF ? null : action;
}

export function selectArrOptional(arr) {
  return arr.length ? arr : null;
}

export function selectArr(obj = {}) {
  return selectArrOptional(Object.keys(obj).map(key => obj[key]));
}
