import React from "react";
import PropTypes from "prop-types";

import { storiesOf } from "@storybook/react";

import range from "lodash.range";
import { scaleBand, interpolateInferno } from "d3-scale";

import ReactCanvas from "../src/index";

const { Surface } = ReactCanvas;

import Alea from "alea";

const random = new Alea(0);
random();
const NUM_ROWS = 16;
const NUM_COLS = 1000;
const rowsRange = range(0, NUM_ROWS);
const colRange = range(0, NUM_COLS);
const rows = rowsRange.map(() => colRange.map(() => random()));

const heatmapDraw = (ctx, layer) => {
  const data = layer.data;
  const x = layer.frame.x;
  const y = layer.frame.y;
  const width = layer.frame.width;
  const height = layer.frame.height;

  const fillColor = layer.backgroundColor || "#FFF";

  const horizontalScale = scaleBand()
    .domain(rowsRange)
    .range([x, x + width]);
  const verticalScale = scaleBand()
    .domain(colRange)
    .range([y, y + height]);

  ctx.fillStyle = fillColor;
  data.forEach((row, rowIdx) => {
    row.forEach((col, colIdx) => {
      ctx.fillStyle = interpolateInferno(col);
      const rectDimensions = {
        x: horizontalScale(rowIdx),
        y: verticalScale(colIdx),
        width: horizontalScale.bandwidth(),
        height: verticalScale.bandwidth()
      };
      ctx.fillRect(
        rectDimensions.x,
        rectDimensions.y,
        rectDimensions.width,
        rectDimensions.height
      );
    });
  });
};

const heatmapApplyProps = (layer, style, prevProps, props) => {
  layer.shadowColor = style.shadowColor || 0;
  layer.shadowOffsetX = style.shadowOffsetX || 0;
  layer.shadowOffsetY = style.shadowOffsetY || 0;
  layer.shadowBlur = style.shadowBlur || 0;
  layer.data = props.data || [];
};

const Heatmap = ReactCanvas.registerCustomComponent(
  "Heatmap",
  heatmapApplyProps,
  heatmapDraw
);

class App extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
  };

  render() {
    const { data, height, width, x, y } = this.props;

    return (
      <Surface top={y} left={x} width={width} height={height}>
        <Heatmap
          background={"blue"}
          style={{
            top: y,
            left: x,
            width: width,
            height: height,
            backgroundColor: "green",
            borderColor: "#000",
            borderWidth: 1,
            shadowColor: "#999",
            shadowOffsetX: 15,
            shadowOffsetY: 15,
            shadowBlur: 20
          }}
          data={data}
        />
      </Surface>
    );
  }
}

storiesOf("Heatmap", module).add("heatmap", () => {
  const props = {
    height: 800,
    width: 800,
    x: 0,
    y: 0,
    size: { width: 80, height: 80 }
  };
  return (
    <div>
      <App data={rows} {...props} />
    </div>
  );
});
