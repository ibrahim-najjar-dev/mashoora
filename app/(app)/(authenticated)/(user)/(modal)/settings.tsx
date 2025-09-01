import { SectionList, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";

// const SECTIONS: {
//   header: {
//     title: string;
//   };
//   items: {
//     id: string;
//     icon?: string;
//     label: string;
//     type: "select" | "switch";
//   }[];
// }[] = [
//   {
//     header: {
//       title: "",
//     },
//     items: [
//       {
//         id: "language",
//         label: "Language",
//         type: "select",
//       },
//       {
//         id: "dark-mode",
//         label: "Dark Mode",
//         type: "switch",
//       },
//     ],
//   },
// ];

const DATA = [
  {
    title: "Main dishes",
    data: ["Pizza", "Burger", "Risotto"],
  },
  {
    title: "Sides",
    data: ["French Fries", "Onion Rings", "Fried Shrimps"],
  },
  {
    title: "Drinks",
    data: ["Water", "Coke", "Beer"],
  },
  {
    title: "Desserts",
    data: ["Cheese Cake", "Ice Cream"],
  },
];

const Settings = () => {
  return (
    <SafeAreaProvider>
      <View className="flex-1">
        <SectionList
          className="pt-safe"
          sections={DATA}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <View className="py-2 border-t border-border bg-secondary/80 px-4">
              <Text>{item}</Text>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="font-Geist_Bold text-4xl">{title}</Text>
          )}
          // ItemSeparatorComponent={() => <Separator />}
          ListEmptyComponent={() => <Text>empty</Text>}
        />
      </View>
    </SafeAreaProvider>
  );
};

export default Settings;
