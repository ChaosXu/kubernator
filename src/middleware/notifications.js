import { notification } from 'antd';

export class NotiErrorApi {
  constructor(apiResponse, netResponse) {

    // api response is an object
    if (typeof apiResponse === 'object' && apiResponse.kind === 'Status') {
      const { code, reason, message } = apiResponse;
      this.code = code;
      this.message = `${code} ${reason}`;
      this.description = message;
    }

    // api response is a string or nothing
    else {
      const { status, statusText, url } = netResponse;
      this.code = status;
      this.message = `${status} ${statusText}`;
      this.description = apiResponse || url;
      this.silent = status === 403;
    }

    //
    this.duration = 0;
    this.style = { 'backgroundColor': 'lightpink' };
  }
}

export default store => next => action => {
  const { payload: { error } = {}} = action;
  if (error) {

    // NotiErrorApi
    if (error instanceof NotiErrorApi) {
      const { silent, description } = error;
      if (!silent) notification.open(error);
      else console.log(description);
    }

    // general error
    else {
      const { title, message } = error;
      notification.open({
        message: title || 'Warning',
        description: message || 'No description',
        style: { 'backgroundColor': 'bisque' },
        duration: 3,
      });
    }
  }
  return next(action);
};
