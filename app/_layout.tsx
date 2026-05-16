import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

import { hydrateAccessToken } from "@/src/api/authToken";
import { LoadingScreen } from "@/src/components/common/loading/LoadingScreen";
import { colors } from "@/src/constants";

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const token = await hydrateAccessToken();
        if (!isMounted) return;

        const isAuthRoute = segments[0] === "(auth)";
        if (!token && !isAuthRoute) {
          router.replace("/(auth)/login");
        }
      } finally {
        if (isMounted) {
          setAuthReady(true);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [router, segments]);

  if (!authReady) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            flex: 1,
            backgroundColor: colors.bgSecondary,
          },
        }}
      />
    </QueryClientProvider>
  );
}
