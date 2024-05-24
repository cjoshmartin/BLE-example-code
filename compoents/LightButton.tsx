import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Text } from "@ui-kitten/components";

const baseSize = 48;

function OffIcon(){
    return ( <MaterialCommunityIcons name="lightbulb-off" size={baseSize} 
    />)
}

function OnIcon(){
    return ( <MaterialCommunityIcons name="lightbulb-on" size={baseSize} color="yellow" />)
}

export default function LightButton(props: any) {
    const [isOn, setIsOn] = useState(false);

    useEffect(() => {
        setIsOn(Boolean((props.value & props.mask)  == props.mask))
    }, [props.value])

    function handleChange(){
        const value = props.value ^ props.mask;
        setIsOn(Boolean(value == props.mask))

        if(props.onChange){
            props.onChange(value);
        }
    }

    return (
      <Button
        onPress={handleChange}
        appearance='outline'
        style={{
          width: baseSize + 45,
          height: baseSize + 45,
          alignItems: "center",
          justifyContent: "center",
        }}
        // disabled={true}
      >
        {isOn ? <OnIcon /> : <OffIcon />}
        <Text  
        category="label"
        style={{
        }}>{props.name}</Text>
      </Button>
    );
}