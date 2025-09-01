import { Button } from "~/components/ui/button";
import { useAuth } from "@clerk/clerk-expo";
import { View } from "~/components/ui/view";
import { Text } from "~/components/ui/text";
import * as Form from "~/components/ui/form";
import React from "react";
import Icons from "~/components/ui/icons";
import { ChevronRight } from "lucide-react-native";
import * as AC from "@bacons/apple-colors";

const Settings = () => {
  const { signOut } = useAuth();
  const [on, setOn] = React.useState(false);

  return (
    <View className="flex-1">
      <Form.List navigationTitle="Settings" className="bg-background">
        <Form.Section title="Developer">
          <Form.Link
            target="_blank"
            href="https://evanbacon.dev"
            hint="Visit Evan Bacon's website"
          >
            Evan Bacon
          </Form.Link>
          {/* sign out */}
          <Form.Link href={"/settings/switch-account"}>
            Switch Account
          </Form.Link>
          <Form.Link href={"/availability"}>Availability Hours</Form.Link>
          <Form.FormItem>
            <Form.Text
              onPress={() => {
                signOut();
              }}
            >
              Sign out
            </Form.Text>
          </Form.FormItem>
          <Form.Toggle value={on} onValueChange={setOn}>
            Evan Bacon in browser
          </Form.Toggle>
        </Form.Section>
        <Form.Section>
          <Form.TextField placeholder="First name" />
          <Form.TextField placeholder="Last name" />
          <Form.Link
            href="https://evanbacon.dev"
            systemImage={
              <Icons.SolarBookmarkCircleBoldDuotone
                height={20}
                width={20}
                color={AC.systemGray}
              />
            }
            hintImage={
              <ChevronRight height={20} width={20} color={AC.systemGray} />
            }
          >
            Evan Bacon
          </Form.Link>
        </Form.Section>
      </Form.List>
    </View>
  );
};

export default Settings;
