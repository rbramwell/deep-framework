/**
 * Created by AlexanderC on 6/10/15.
 */

'use strict';

import {SuperagentResponse} from './SuperagentResponse';
import {Request} from './Request';
import {Action} from './Action';
import Http from 'superagent';

/**
 * Resource request instance
 */
export class LocalRequest extends Request {
  constructor(...args) {
    super(...args);
  }

  /**
   * @param {Function} callback
   * @returns {LocalRequest|*}
   */
  _send(callback = null) {
    let actionType = this._action.type;

    if (actionType === Action.LAMBDA) {
      let data = {
        lambda: this._action.source.original,
        payload: this.payload,
        method: this._method,
      };

      Http.post(LocalRequest.LOCAL_LAMBDA_ENDPOINT)
        .send(data)
        .end(function(error, response) {
          callback && callback(new SuperagentResponse(this, response, error));
        }.bind(this));
    } else {
      return this.prototype.useNative()._send(...arguments);
    }

    return this;
  }

  /**
   * @returns {String}
   */
  static get LOCAL_LAMBDA_ENDPOINT() {
    return '/_/lambda';
  }
}
