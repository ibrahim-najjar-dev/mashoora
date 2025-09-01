import BottomSheet from "@gorhom/bottom-sheet";
import { useRef } from "react";
import AvailabilityPicker from "~/components/availability-picker";
import { View } from "~/components/ui/view";

const AvailabilityScreen = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <>
      <View className="flex-1">
        <AvailabilityPicker bottomSheetRef={bottomSheetRef} />
      </View>
      {/* <BottomSheet ref={bottomSheetRef} >
        <BottomSheetView>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet> */}
    </>
  );
};

export default AvailabilityScreen;
