/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/articles` | `/(tabs)/charging` | `/(tabs)/community` | `/(tabs)/evs` | `/_sitemap` | `/articles` | `/charging` | `/community` | `/evs`;
      DynamicRoutes: `/article/${Router.SingleRoutePart<T>}` | `/ev/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/article/[slug]` | `/ev/[slug]`;
    }
  }
}
