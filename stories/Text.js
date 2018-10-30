import React from "react";
import { storiesOf } from "@storybook/react";
import { Text, Group, Image, Surface } from "../src/index";

storiesOf("Text", module).add("hello-world", () => {
  const props = { size: { width: 400, height: 400 } };
  return (
    <div>
      <Surface
        top={0}
        left={0}
        width={props.size.width}
        height={props.size.height}
      >
        <Group>
          <Text
            style={{
              top: 0,
              left: 0,
              width: props.size.width,
              height: props.size.height
            }}
          >
            Hello World
          </Text>
          <Text
            style={{
              top: 30,
              left: 0,
              color: "red",
              width: props.size.width,
              height: props.size.height
            }}
          >
            Hello World 2
          </Text>

          <Image
            style={{
              top: 50,
              left: 0
            }}
            src="https://i.imgur.com/U1p9DSP.png"
          />
        </Group>
      </Surface>
    </div>
  );
});
