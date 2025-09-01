import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { Alert } from "react-native";
import * as Form from "~/components/ui/form";
import { Roles } from "~/types/globals";
import * as AC from "@bacons/apple-colors";
import { useRole } from "~/lib/auth";

const SwitchAccount = () => {
  const { sessionClaims } = useAuth();
  console.log(sessionClaims?.metadata.role);
  const { client, setActive, signOut } = useClerk();
  const { user } = useUser();

  const availableSessions = client?.sessions || [];
  const currentSessionId = availableSessions.find(
    (session) => session.status === "active"
  )?.id;

  const onSwitchAccount = async (sessionId: string) => {
    try {
      await setActive({ session: sessionId });
    } catch (error) {
      Alert.alert("Error", "Failed to switch account. Please try again.");
      console.error("Switch account error:", error);
    }
  };

  const onSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of this account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
              console.error("Sign out error:", error);
            }
          },
        },
      ]
    );
  };

  const formatUserName = (
    firstName?: string | null,
    lastName?: string | null,
    email?: string | null
  ) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return email || "Unknown User";
  };

  return (
    <Form.List navigationTitle="Switch Account">
      {availableSessions.length > 1 && (
        <Form.Section
          title="Available Accounts"
          footer="Select an account to switch to. Your current account is marked with a checkmark."
        >
          {availableSessions.map((session) => {
            const isCurrentSession = session.id === currentSessionId;

            const userName = formatUserName(
              session.publicUserData?.firstName,
              session.publicUserData?.lastName,
              session.publicUserData?.identifier
            );

            return (
              <Form.FormItem
                key={session.id}
                onPress={
                  isCurrentSession
                    ? undefined
                    : () => onSwitchAccount(session.id)
                }
              >
                <Form.VStack>
                  <Form.Text bold={isCurrentSession}>{userName}</Form.Text>
                  <Form.Text style={{ fontSize: 14, opacity: 0.7 }}>
                    {session.publicUserData?.identifier}
                  </Form.Text>
                </Form.VStack>
                <Form.Spacer />
                {isCurrentSession && (
                  <Form.Text style={{ color: AC.systemBlue }}>
                    Current
                  </Form.Text>
                )}
              </Form.FormItem>
            );
          })}
        </Form.Section>
      )}

      {availableSessions.length <= 1 && (
        <Form.Section
          title="Current Account"
          footer="You only have one account signed in. Sign in with additional accounts to switch between them."
        >
          <Form.FormItem>
            <Form.VStack>
              <Form.Text bold>{user?.fullName || "Unknown User"}</Form.Text>
              <Form.Text style={{ fontSize: 14, opacity: 0.7 }}>
                {user?.phoneNumbers[0]?.phoneNumber}
              </Form.Text>
            </Form.VStack>
            <Form.Spacer />
            <Form.Text style={{ color: AC.systemBlue }}>Current</Form.Text>
          </Form.FormItem>
        </Form.Section>
      )}

      <Form.Section title="Account Management">
        <Form.Link href="/(app)/(authenticated)/(consultant)/(modal)/sign-in">
          <Form.Text>Add Another Account</Form.Text>
        </Form.Link>

        <Form.FormItem onPress={onSignOut}>
          <Form.Text style={{ color: AC.systemRed }}>Sign Out</Form.Text>
        </Form.FormItem>
      </Form.Section>

      <Form.Section footer="When you switch accounts, you'll be signed in as that user and have access to their data and permissions." />
    </Form.List>
  );
};

export default SwitchAccount;
