import InterceptorManager from "./InterceptorManager";
import XHRRequest from "./request";

class XHR {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager(),
      response: new InterceptorManager(),
    };
  }

  /**
   * 发送请求
   *
   * @param {string|object} configORurl 请求配置 或者 请求地址
   * @param {object} config 请求配置
   *
   * @returns {Promise} 请求结果
   */
  request(configORurl, config) {
    if (typeof configORurl == "string") {
      // configORurl 是 url
      config = config || {};
      config.url = configORurl;
    } else {
      // configORurl 是 config
      config = configORurl || {};
    }

    // 合并 配置项参数
    config = Object.assign({}, this.defaults, config);
    // 设置 请求方式
    config.method = (config.method || "get").toLowerCase();

    // 收集拦截器
    let requestInterceptorChains = this.interceptors.request
      .get()
      .map((item) => [item.rejected, item.fulfilled])
      .flat()
      .reverse();
    let responseInterceptorChains = this.interceptors.response
      .get()
      .map((item) => [item.fulfilled, item.rejected])
      .flat();

    let idx = 0,
      len = 0,
      promise;
    // 请求拦截器
    let newConfig = config;
    len = requestInterceptorChains.length;
    while (idx < len) {
      const onFulfilled = requestInterceptorChain[idx++];
      const onRejected = requestInterceptorChain[idx++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (e) {
        onRejected.call(this, e);
        break;
      }
    }
    // 发送请求
    try {
      promise = XHRRequest.call(this, newConfig);
    } catch (e) {
      promise = Promise.reject(e);
      return promise;
    }
    // 响应拦截器
    idx = 0;
    len = responseInterceptorChains.length;
    while (idx < len) {
      promise = promise.then(
        responseInterceptorChains[idx++],
        responseInterceptorChains[idx++]
      );
    }
    return promise;
  }
}

["delete", "get", "head", "options"].forEach((method) => {
  XHR.prototype[method] = function (url, config) {
    return this.request(
      Object.assign({}, config, {
        method,
        url,
        data: (config || {}).data,
      })
    );
  };
});

["post", "put", "patch"].forEach((method) => {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(
        Object.assign({}, config, {
          method,
          url,
          headers: isForm
            ? {
                "Content-Type": "multipart/form-data",
              }
            : {},
          data,
        })
      );
    };
  }

  XHR.prototype[method] = generateHTTPMethod();

  XHR.prototype[method + "Form"] = generateHTTPMethod(true);
});

export default XHR;
