import BaseLayout from "@/layouts/base-layout";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useTopics } from "@/hooks/use-topics";
/* import { TanStackRouterDevtools } from '@tanstack/react-router-devtools' */

/*
 * Uncomment the code in this file to enable the router devtools.
 */

function Root() {
  const { internalTopics, externalTopics, hotTopics } = useTopics();

  return (
    <BaseLayout
      internalCount={internalTopics.length}
      externalCount={externalTopics.length}
      hotCount={hotTopics.length}
    >
      <Outlet />
      {/* Uncomment the following line to enable the router devtools */}
      {/* <TanStackRouterDevtools /> */}
    </BaseLayout>
  );
}

export const Route = createRootRoute({
  component: Root,
});
