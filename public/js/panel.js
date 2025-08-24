/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@pipedrive/app-extensions-sdk/dist/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/@pipedrive/app-extensions-sdk/dist/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({ value: true }));

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

exports.Command = void 0;
(function (Command) {
    Command["SHOW_SNACKBAR"] = "show_snackbar";
    Command["SHOW_CONFIRMATION"] = "show_confirmation";
    Command["RESIZE"] = "resize";
    Command["INITIALIZE"] = "initialize";
    Command["OPEN_MODAL"] = "open_modal";
    Command["CLOSE_MODAL"] = "close_modal";
    Command["GET_SIGNED_TOKEN"] = "get_signed_token";
    Command["REDIRECT_TO"] = "redirect_to";
    Command["SHOW_FLOATING_WINDOW"] = "show_floating_window";
    Command["HIDE_FLOATING_WINDOW"] = "hide_floating_window";
    Command["SET_NOTIFICATION"] = "set_notification";
    Command["SET_FOCUS_MODE"] = "set_focus_mode";
    Command["GET_METADATA"] = "get_metadata";
})(exports.Command || (exports.Command = {}));
exports.Event = void 0;
(function (Event) {
    Event["VISIBILITY"] = "visibility";
    Event["CLOSE_CUSTOM_MODAL"] = "close_custom_modal";
    Event["PAGE_VISIBILITY_STATE"] = "page_visibility_state";
    Event["USER_SETTINGS_CHANGE"] = "user_settings_change";
})(exports.Event || (exports.Event = {}));
exports.MessageType = void 0;
(function (MessageType) {
    MessageType["COMMAND"] = "command";
    MessageType["LISTENER"] = "listener";
    MessageType["TRACK"] = "track";
})(exports.MessageType || (exports.MessageType = {}));
exports.Color = void 0;
(function (Color) {
    Color["PRIMARY"] = "primary";
    Color["SECONDARY"] = "secondary";
    Color["NEGATIVE"] = "negative";
})(exports.Color || (exports.Color = {}));
exports.Modal = void 0;
(function (Modal) {
    Modal["DEAL"] = "deal";
    Modal["ORGANIZATION"] = "organization";
    Modal["PERSON"] = "person";
    Modal["ACTIVITY"] = "activity";
    Modal["JSON_MODAL"] = "json_modal";
    Modal["CUSTOM_MODAL"] = "custom_modal";
})(exports.Modal || (exports.Modal = {}));
exports.ModalStatus = void 0;
(function (ModalStatus) {
    ModalStatus["CLOSED"] = "closed";
    ModalStatus["SUBMITTED"] = "submitted";
})(exports.ModalStatus || (exports.ModalStatus = {}));
exports.TrackingEvent = void 0;
(function (TrackingEvent) {
    TrackingEvent["FOCUSED"] = "focused";
})(exports.TrackingEvent || (exports.TrackingEvent = {}));
exports.VisibilityEventInvoker = void 0;
(function (VisibilityEventInvoker) {
    VisibilityEventInvoker["USER"] = "user";
    VisibilityEventInvoker["COMMAND"] = "command";
})(exports.VisibilityEventInvoker || (exports.VisibilityEventInvoker = {}));
var UserSettingsTheme;
(function (UserSettingsTheme) {
    UserSettingsTheme["DARK"] = "dark";
    UserSettingsTheme["LIGHT"] = "light";
})(UserSettingsTheme || (UserSettingsTheme = {}));
exports.View = void 0;
(function (View) {
    View["DEALS"] = "deals";
    View["LEADS"] = "leads";
    View["ORGANIZATIONS"] = "organizations";
    View["CONTACTS"] = "contacts";
    View["CAMPAIGNS"] = "campaigns";
    View["PROJECTS"] = "projects";
    View["SETTINGS"] = "settings";
})(exports.View || (exports.View = {}));

function detectIframeFocus(cb) {
    let isFocused = false;
    window === null || window === void 0 ? void 0 : window.addEventListener('focus', () => {
        if (!isFocused) {
            cb();
        }
        isFocused = true;
    });
    window === null || window === void 0 ? void 0 : window.addEventListener('blur', () => {
        isFocused = false;
    });
}
function detectIdentifier() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}
function detectUserSettings() {
    const params = new URLSearchParams(window.location.search);
    return {
        theme: params.get('theme') === UserSettingsTheme.DARK ? UserSettingsTheme.DARK : UserSettingsTheme.LIGHT,
    };
}

const commandKeys = Object.values(exports.Command);
const eventKeys = Object.values(exports.Event);
class AppExtensionsSDK {
    constructor(options = {}) {
        const { identifier, targetWindow } = options;
        this.initialized = false;
        this.window = targetWindow !== null && targetWindow !== void 0 ? targetWindow : window.parent;
        this.identifier = identifier !== null && identifier !== void 0 ? identifier : detectIdentifier();
        this.userSettings = detectUserSettings();
        if (!this.identifier) {
            throw new Error('Missing custom UI identifier');
        }
        detectIframeFocus(() => {
            this.track(exports.TrackingEvent.FOCUSED);
        });
    }
    postMessage(payload, targetOrigin = '*') {
        return new Promise((resolve, reject) => {
            const channel = new MessageChannel();
            const message = {
                payload,
                id: this.identifier,
            };
            channel.port1.onmessage = ({ data: response }) => {
                channel.port1.close();
                const { error, data } = response;
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(data);
                }
            };
            this.window.postMessage(message, targetOrigin, [channel.port2]);
        });
    }
    execute(command, ...args) {
        if (!this.initialized) {
            throw new Error('SDK is not initialized');
        }
        if (!commandKeys.includes(command)) {
            throw new Error('Invalid command');
        }
        return this.postMessage({
            command,
            args: args[0],
            type: exports.MessageType.COMMAND,
        });
    }
    track(event, targetOrigin = '*') {
        const message = {
            payload: {
                type: exports.MessageType.TRACK,
                event,
            },
            id: this.identifier,
        };
        this.window.postMessage(message, targetOrigin);
    }
    onPageVisibilityChange(cb) {
        const onChange = () => {
            cb({ data: { state: document.visibilityState } });
        };
        document.addEventListener('visibilitychange', onChange);
        return () => document.removeEventListener('visibilitychange', onChange);
    }
    listen(event, onEventReceived) {
        if (!eventKeys.includes(event)) {
            throw new Error('Invalid event');
        }
        if (event === exports.Event.PAGE_VISIBILITY_STATE) {
            return this.onPageVisibilityChange(onEventReceived);
        }
        const channel = new MessageChannel();
        const message = {
            payload: {
                type: exports.MessageType.LISTENER,
                event,
            },
            id: this.identifier,
        };
        channel.port1.onmessage = ({ data }) => {
            if (data.error) {
                channel.port1.close();
            }
            onEventReceived(data);
            if (event === exports.Event.USER_SETTINGS_CHANGE && data) {
                this.userSettings = data;
            }
        };
        this.window.postMessage(message, '*', [channel.port2]);
        return () => {
            channel.port1.close();
        };
    }
    setWindow(window) {
        this.window = window;
    }
    initialize(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.postMessage({
                command: exports.Command.INITIALIZE,
                args: options,
                type: exports.MessageType.COMMAND,
            });
            this.initialized = true;
            return this;
        });
    }
}

exports["default"] = AppExtensionsSDK;
//# sourceMappingURL=index.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./resources/js/panel.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pipedrive_app_extensions_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @pipedrive/app-extensions-sdk */ "./node_modules/@pipedrive/app-extensions-sdk/dist/index.js");


// No sdk.initialize() needed
var sdk = _pipedrive_app_extensions_sdk__WEBPACK_IMPORTED_MODULE_0__;

// Use context.observe directly
sdk.context.observe(function (context) {
  var _context$person, _context$deal;
  var email = ((_context$person = context.person) === null || _context$person === void 0 ? void 0 : _context$person.primary_email) || ((_context$deal = context.deal) === null || _context$deal === void 0 || (_context$deal = _context$deal.person) === null || _context$deal === void 0 ? void 0 : _context$deal.email);
  console.log('Lead email:', email);
  var container = document.getElementById('transactions');
  document.getElementById('lead-email').innerText = email || 'N/A';
  if (!email) {
    container.innerHTML = 'No email found for this lead.';
    return;
  }
  fetch('/api/stripe_data?email=' + encodeURIComponent(email)).then(function (res) {
    return res.json();
  }).then(function (data) {
    if (data.error) {
      container.innerHTML = '<p style="color:red;">' + data.error + '</p>';
      return;
    }
    var html = '<table><tr><th>ID</th><th>Amount</th><th>Status</th><th>Date</th><th>Receipt</th></tr>';
    (data.invoices || []).forEach(function (inv) {
      html += "<tr>\n                    <td>".concat(inv.id, "</td>\n                    <td>").concat(inv.amount, "</td>\n                    <td>").concat(inv.status, "</td>\n                    <td>").concat(inv.date, "</td>\n                    <td>").concat(inv.receipt_url ? '<a href="' + inv.receipt_url + '" target="_blank">View</a>' : '', "</td>\n                </tr>");
    });
    html += '</table>';
    container.innerHTML = html;
  })["catch"](function (err) {
    console.error(err);
    container.innerHTML = 'Error fetching transactions';
  });
});
})();

/******/ })()
;