import buildFullPath from "../helpers/buildFullPath";

export default function XHRRequest(config) {
  // if (["post", "put", "patch"].indexOf(config.method) !== -1) {
  //   config.headers.setContentType("application/x-www-form-urlencoded", false);
  // }
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      const username = config.auth.username || "";
      const password = config.auth.password
        ? unescape(encodeURIComponent(config.auth.password))
        : "";
      requestHeaders.set(
        "Authorization",
        "Basic " + btoa(username + ":" + password)
      );
    }

    const responseType = config.responseType;
    let onCanceled;

    function onloadend() {
      if (!xhr) {
        return;
      }
      const responseData =
        responseType || responseType === "text"
          ? xhr.responseText
          : xhr.response;
      const response = {
        data: responseData,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: xhr.getAllResponseHeaders(),
        config,
        xhr,
      };

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject(new Error("Request failed with status code " + xhr.status));
      }
      // TODO
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      // Clean up request
      xhr = null;
    }

    const fullPath = buildFullPath(config.baseURL, config.url);

    xhr.open(config.method, buildURL(fullPath, config.params), true);
    xhr.timeout = config.timeout;
    xhr.onreadystatechange = function handleLoad() {
//       if (!xhr || request.readyState !== 4) {
//         return;
//       }
// 
//       if (
//         xhr.status === 0 &&
//         !(xhr.responseURL && xhr.responseURL.indexOf("file:") === 0)
//       ) {
//         return;
//       }

      setTimeout(onloadend);
    };
    xhr.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new Error("Request aborted", config, xhr));
      xhr = null;
    };
    xhr.onerror = function handleError() {
      reject(new Error("Network Error", config, xhr));
      xhr = null;
    };
    xhr.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = config.timeout
        ? "timeout of " + config.timeout + "ms exceeded"
        : "timeout exceeded";

      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new Error(timeoutErrorMessage, config, xhr));
      xhr = null;
    };
    // set headers
    for (let key in config.headers) {
      xhr.setRequestHeader(key, config.headers[key]);
    }
    // set responseType
    if (responseType && responseType !== "json") {
      xhr.responseType = config.responseType;
    }

    if (config.cancelToken) {
      onCanceled = (cancel) => {
        if (!xhr) {
          return;
        }
        reject(!cancel || cancel.type ? new Error(null, config, xhr) : cancel);
        xhr.abort();
        xhr = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
    }
    // Send the request
    xhr.send(config.data || null);
  })
  .then(
    (res) => {
      return res;
    },
    (e) => {
      return Promise.reject(e);
    }
  );
}
function buildURL(url, params) {
  if (params) {
    url += "?";
    for (let key in params) {
      url += `${key}=${params[key]}&`;
    }
    url = url.slice(0, -1);
  }
  return url;
}
export function isCancel(value) {
  return !!(value && value.__CANCEL__);
}
