/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adhkarData from "../adhkarData.js";
import type * as adhkarProgress from "../adhkarProgress.js";
import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as cycleTracking from "../cycleTracking.js";
import type * as http from "../http.js";
import type * as personalNotes from "../personalNotes.js";
import type * as quranProgress from "../quranProgress.js";
import type * as scienceProgress from "../scienceProgress.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adhkarData: typeof adhkarData;
  adhkarProgress: typeof adhkarProgress;
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  cycleTracking: typeof cycleTracking;
  http: typeof http;
  personalNotes: typeof personalNotes;
  quranProgress: typeof quranProgress;
  scienceProgress: typeof scienceProgress;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
