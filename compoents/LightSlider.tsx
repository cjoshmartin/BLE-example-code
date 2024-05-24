//@ts-nocheck
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {  Text } from "@ui-kitten/components";

import VerticalSlider from "rn-vertical-slider";

export default function LightSlider(props:any) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        setValue(props.value);
    }, [props.value])
    
    function HandleChange(value) {
        setValue(value);
        if(props?.onChange){
            props?.onChange(value);
        }
    }
    return (
      <GestureHandlerRootView
        style={{
            alignItems: "center",
            justifyContent:"center",
            gap: 2
        }}
      >
        <VerticalSlider
          value={value}
          onChange={HandleChange}
          height={200}
          width={40}
          step={1}
          min={0}
          max={100}
          borderRadius={5}
          minimumTrackTintColor="#2979FF"
          maximumTrackTintColor="#D1D1D6"
          showBallIndicator
          ballIndicatorColor="#2979FF"
          ballIndicatorTextColor="#fff"
          ballIndicatorWidth={80}
          ballIndicatorHeight={40}
        />
        <Text
        category="label"
        >{props.name}</Text>
      </GestureHandlerRootView>
    );
}