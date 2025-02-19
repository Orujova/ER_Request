import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useIsAuthenticated,
  useMsal,
} from "@azure/msal-react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export const AuthenticationStatus = () => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const username = accounts[0]?.username || accounts[0]?.name || "";

  return (
    <div className="flex items-center">
      <AuthenticatedTemplate>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">{username}</span>
          <SignOutButton />
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <SignInButton />
      </UnauthenticatedTemplate>
    </div>
  );
};
