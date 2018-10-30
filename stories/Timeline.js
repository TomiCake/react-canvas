import React from "react";
import ReactCanvas from "../src/index";
import Page from "./components/Page";
import articles from "./data";

import { storiesOf } from "@storybook/react";
const { ListView, Surface } = ReactCanvas;

class App extends React.Component {
  render() {
    const size = this.getSize();

    return (
      <Surface top={0} left={0} width={size.width} height={size.height}>
        <ListView
          style={this.getListViewStyle()}
          snapping={true}
          scrollingDeceleration={0.92}
          scrollingPenetrationAcceleration={0.13}
          numberOfItemsGetter={this.getNumberOfPages}
          itemHeightGetter={this.getPageHeight}
          itemGetter={this.renderPage}
        />
      </Surface>
    );
  }

  renderPage = (pageIndex, scrollTop) => {
    const size = this.getSize();
    const article = articles[pageIndex % articles.length];
    const pageScrollTop = pageIndex * this.getPageHeight() - scrollTop;

    return (
      <Page
        width={size.width}
        height={size.height}
        article={article}
        pageIndex={pageIndex}
        scrollTop={pageScrollTop}
      />
    );
  };

  getSize = () => {
    const size = document.getElementById("root").getBoundingClientRect();
    size.height = 800;
    return size;
  };

  getListViewStyle = () => {
    const size = this.getSize();

    return {
      top: 0,
      left: 0,
      width: size.width,
      height: size.height,
      backgroundColor: "#320000"
    };
  };

  getNumberOfPages = () => {
    return 1000;
  };

  getPageHeight = () => {
    return this.getSize().height;
  };
}

storiesOf("Timeline", module).add("app", () => {
  return <App />;
});
