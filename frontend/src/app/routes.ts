import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { PrototypeLanding } from "./pages/PrototypeLanding";
import { OnboardingDataIngestion } from "./pages/OnboardingDataIngestion";
import { DataIngestion } from "./pages/DataIngestion";
import { WireframeLayout } from "./components/WireframeLayout";
import { WireframeDashboard } from "./pages/WireframeDashboard";
import { PriceForecast } from "./pages/PriceForecast";
import { MarketSentiment } from "./pages/MarketSentiment";
import { AICopilot } from "./pages/AICopilot";
import { RiskAlerts } from "./pages/RiskAlerts";
import { Reports } from "./pages/Reports";
import { InsightsPerformance } from "./pages/InsightsPerformance";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PrototypeLanding,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/onboarding",
    Component: OnboardingDataIngestion,
  },
  {
    path: "/upload",
    Component: DataIngestion,
  },
  {
    path: "/app",
    Component: WireframeLayout,
    children: [
      { index: true, Component: WireframeDashboard },
      { path: "forecast", Component: PriceForecast },
      { path: "sentiment", Component: MarketSentiment },
      { path: "copilot", Component: AICopilot },
      { path: "alerts", Component: RiskAlerts },
      { path: "reports", Component: Reports },
      { path: "insights", Component: InsightsPerformance },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);