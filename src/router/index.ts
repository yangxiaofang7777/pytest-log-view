import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";

import AppTypeSelect from "../pages/AppTypeSelect.vue";
import LogView from "@/pages/LogView/LogView.vue";
import type { AppType } from "@/types";

const routes: RouteRecordRaw[] = [{
  path: "/",
  redirect: "/select-app-type",
}, {
  path: "/select-app-type",
  name: "selectAppType",
  component: AppTypeSelect,
}, {
  path: "/log-view",
  name: "logView",
  component: LogView,
}];

const router = createRouter({
  history: createWebHashHistory('/pytest-log-view/'),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.name === "logView") {
    const query = to.query;
    if (query.appType) {
      const appType = query.appType as AppType;
      if (appType === "LOCAL_FILE") return next();
      if (appType === "POST_MESSAGE") return next();
      if (appType === "RESTAPI") {
        if (query.taskId) return next();
        return next({ name: "selectAppType" });
      }
    }
    return next({ name: "selectAppType" });
  }
  next();
});

export default router;
