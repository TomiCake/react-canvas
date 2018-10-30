import React from "react";
import { storiesOf } from "@storybook/react";

import ReactCanvas from "../src/index";

const { Surface } = ReactCanvas;

const circleDraw = function(ctx, layer) {
  const x = layer.frame.x;
  const y = layer.frame.y;
  const width = layer.frame.width;
  const height = layer.frame.height;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const fillColor = layer.backgroundColor || "#FFF";
  const strokeColor = layer.borderColor || "#FFF";
  const strokeWidth = layer.borderWidth || 0;

  const shadowColor = layer.shadowColor || 0;
  const shadowOffsetX = layer.shadowOffsetX || 0;
  const shadowOffsetY = layer.shadowOffsetY || 0;
  const shadowBlur = layer.shadowBlur || 0;

  const radius = Math.min(width / 2, height / 2) - Math.ceil(strokeWidth / 2);

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  if (shadowOffsetX || shadowOffsetY) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;
  }

  ctx.fillStyle = fillColor;
  ctx.fill();
  if (strokeWidth > 0) {
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
  }
};

const circleApplyProps = (layer, style /*, prevProps, props*/) => {
  layer.shadowColor = style.shadowColor || 0;
  layer.shadowOffsetX = style.shadowOffsetX || 0;
  layer.shadowOffsetY = style.shadowOffsetY || 0;
  layer.shadowBlur = style.shadowBlur || 0;
};

const Circle = ReactCanvas.registerCustomComponent(
  "Circle",
  circleApplyProps,
  circleDraw
);

class App extends React.Component {
  render() {
    return (
      <Surface top={10} left={10} width={500} height={500}>
        <Circle
          background={"blue"}
          style={{
            top: 10,
            left: 10,
            width: 180,
            height: 180,
            backgroundColor: "green",
            borderColor: "#000",
            borderWidth: 1,
            shadowColor: "#999",
            shadowOffsetX: 15,
            shadowOffsetY: 15,
            shadowBlur: 20
          }}
        />
      </Surface>
    );
  }
}

storiesOf("CustomDraw", module).add("green-circle", () => {
  return (
    <div>
      <App />
    </div>
  );
});
