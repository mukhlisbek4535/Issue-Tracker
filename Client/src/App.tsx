import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuthStore } from "@/stores/authStore";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import IssueList from "@/pages/IssueList";
import CreateIssue from "./pages/CreateIssue";
import Labels from "./pages/Labels";
import IssueDetail from "./pages/IssueDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { EditIssue } from "./pages/IssueEdit";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  if (isAuthenticated && token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <Register />
            </AuthRedirect>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<IssueList />} />
          <Route path="/issues/new" element={<CreateIssue />} />
          <Route path="/labels" element={<Labels />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/issues/:id/edit" element={<EditIssue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
