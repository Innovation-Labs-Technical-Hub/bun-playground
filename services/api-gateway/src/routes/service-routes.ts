interface RouteMapping {
  prefix: string;
  serviceUrl: string;
  stripPrefix?: boolean;
}

export function getRouteMappings(): RouteMapping[] {
  return [
    {
      prefix: "/api/users",
      serviceUrl: process.env.USER_SERVICE_URL ?? "http://localhost:3001",
      stripPrefix: false,
    },
  ];
}

export function findServiceForPath(path: string): RouteMapping | undefined {
  return getRouteMappings().find((route) => path.startsWith(route.prefix));
}
