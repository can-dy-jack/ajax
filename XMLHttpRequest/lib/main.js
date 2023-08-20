import XHR from "./core/XHR";
import defaults from "./core/defaults";
import CancelToken from "./core/CancelToken";
import { isCancel } from "./core/request";

const extend = (a, b, thisArg) => {
  Object.keys(b).forEach((val, key) => {
    if (thisArg && Array.isArray(val)) {
      a[key] = val.bind(thisArg);
    } else {
      a[key] = val;
    }
  })
  return a;
}

function createInstance(defaultConfig) {
  const context = new XHR(defaultConfig);
  const instance = XHR.prototype.request.bind(context);

  extend(instance, XHR.prototype, context);
  extend(instance, context, null);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(Object.assign({}, defaultConfig, instanceConfig));
  };

  return instance;
}

const xhr = createInstance(defaults);

xhr.XHR = XHR;
xhr.CancelToken = CancelToken;
xhr.isCancel = isCancel;
xhr.all = function all(promises) {
  return Promise.all(promises);
};

xhr.default = xhr;

export default xhr;
