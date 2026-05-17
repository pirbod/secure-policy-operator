import { useState } from "react";
import type { ReactElement } from "react";
import { Layout, type PageKey } from "./components/Layout";
import { Architecture } from "./pages/Architecture";
import { DeploymentBlueprints } from "./pages/DeploymentBlueprints";
import { EnvironmentOperations } from "./pages/EnvironmentOperations";
import { ExecutiveOverview } from "./pages/ExecutiveOverview";
import { OnboardingFactory } from "./pages/OnboardingFactory";
import { PolicyOperator } from "./pages/PolicyOperator";
import { PresalesAssistant } from "./pages/PresalesAssistant";
import { SupportRunbooks } from "./pages/SupportRunbooks";

const pages: Record<PageKey, ReactElement> = {
  overview: <ExecutiveOverview />,
  presales: <PresalesAssistant />,
  onboarding: <OnboardingFactory />,
  blueprints: <DeploymentBlueprints />,
  policy: <PolicyOperator />,
  operations: <EnvironmentOperations />,
  support: <SupportRunbooks />,
  architecture: <Architecture />
};

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("overview");

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {pages[activePage]}
    </Layout>
  );
}
