"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import Scroller from "scroller";
import Core from "./Core";
const { Group } = Core;
const MAX_CACHED_ITEMS = 100;

class ListView extends Component {
  static propTypes = {
    style: PropTypes.object,
    numberOfItemsGetter: PropTypes.func.isRequired,
    itemHeightGetter: PropTypes.func.isRequired,
    itemGetter: PropTypes.func.isRequired,
    snapping: PropTypes.bool,
    scrollingDeceleration: PropTypes.number,
    scrollingPenetrationAcceleration: PropTypes.number,
    onScroll: PropTypes.func
  };

  static defaultProps = {
    style: { left: 0, top: 0, width: 0, height: 0 },
    snapping: false,
    scrollingDeceleration: 0.95,
    scrollingPenetrationAcceleration: 0.08
  };

  state = {
    scrollTop: 0
  };

  constructor(props) {
    super(props);

    this._itemCache = new Map();
    this._groupCache = new Map();
  }

  componentDidMount() {
    this.createScroller();
    this.updateScrollingDimensions();
  }

  render() {
    if (this._itemCache.size > MAX_CACHED_ITEMS) {
      this._itemCache.clear();
      this._groupCache.clear();
    }

    const items = this.getVisibleItemIndexes().map(this.renderItem);
    return React.createElement(
      Group,
      {
        style: this.props.style,
        onTouchStart: this.handleTouchStart,
        onTouchMove: this.handleTouchMove,
        onTouchEnd: this.handleTouchEnd,
        onMouseDown: this.handleMouseDown,
        onMouseUp: this.handleMouseUp,
        onMouseOut: this.handleMouseOut,
        onMouseMove: this.handleMouseMove,
        onTouchCancel: this.handleTouchEnd
      },
      items
    );
  }

  renderItem = itemIndex => {
    const item = this.props.itemGetter(itemIndex, this.state.scrollTop);
    const priorItem = this._itemCache.get(itemIndex);
    const itemHeight = this.props.itemHeightGetter();

    let group;

    if (item === priorItem) {
      // Item hasn't changed, we can re-use the previous Group element after adjusting style.
      group = this._groupCache.get(itemIndex);
    } else {
      group = React.createElement(
        Group,
        {
          style: { top: 0, left: 0, zIndex: itemIndex },
          useBackingStore: true,
          key: itemIndex
        },
        item
      );

      this._itemCache.set(itemIndex, item);
      this._groupCache.set(itemIndex, group);
    }

    if (group.props.style.width !== this.props.style.width) {
      group.props.style.width = this.props.style.width;
    }

    if (group.props.style.height !== itemHeight) {
      group.props.style.height = itemHeight;
    }

    group.props.style.translateY =
      itemIndex * itemHeight - this.state.scrollTop;

    return group;
  };

  // Events
  // ======

  handleTouchStart = e => {
    if (this.scroller) {
      this.scroller.doTouchStart(e.touches, e.timeStamp);
    }
  };

  handleTouchMove = e => {
    if (this.scroller) {
      e.preventDefault();
      this.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
    }
  };

  handleTouchEnd = e => {
    this.handleScrollRelease(e);
  };

  handleMouseDown = e => {
    //if (e.button !== 2) return;

    if (this.scroller) {
      this.scroller.doTouchStart([e], e.timeStamp);
    }
  };

  handleMouseMove = e => {
    if (this.scroller) {
      e.preventDefault();
      this.scroller.doTouchMove([e], e.timeStamp);
    }
  };

  handleMouseUp = e => {
    //if (e.button !== 2) return;

    this.handleScrollRelease(e);
  };

  handleMouseOut = e => {
    //if (e.button !== 2) return;

    this.handleScrollRelease(e);
  };

  handleScrollRelease = e => {
    if (this.scroller) {
      this.scroller.doTouchEnd(e.timeStamp);
      if (this.props.snapping) {
        this.updateScrollingDeceleration();
      }
    }
  };

  handleScroll = (left, top) => {
    this.setState({ scrollTop: top });
    if (this.props.onScroll) {
      this.props.onScroll(top);
    }
  };

  // Scrolling
  // =========

  createScroller = () => {
    const options = {
      scrollingX: false,
      scrollingY: true,
      decelerationRate: this.props.scrollingDeceleration,
      penetrationAcceleration: this.props.scrollingPenetrationAcceleration
    };
    this.scroller = new Scroller(this.handleScroll, options);
  };

  updateScrollingDimensions = () => {
    const width = this.props.style.width;
    const height = this.props.style.height;
    const scrollWidth = width;
    const scrollHeight =
      this.props.numberOfItemsGetter() * this.props.itemHeightGetter();
    this.scroller.setDimensions(width, height, scrollWidth, scrollHeight);
  };

  getVisibleItemIndexes = () => {
    const itemIndexes = [];
    const itemHeight = this.props.itemHeightGetter();
    const itemCount = this.props.numberOfItemsGetter();
    const scrollTop = this.state.scrollTop;
    let itemScrollTop = 0;

    for (let index = 0; index < itemCount; index++) {
      itemScrollTop = index * itemHeight - scrollTop;

      // Item is completely off-screen bottom
      if (itemScrollTop >= this.props.style.height) {
        continue;
      }

      // Item is completely off-screen top
      if (itemScrollTop <= -this.props.style.height) {
        continue;
      }

      // Part of item is on-screen.
      itemIndexes.push(index);
    }

    return itemIndexes;
  };

  updateScrollingDeceleration = () => {
    let currVelocity = this.scroller.__decelerationVelocityY;
    const currScrollTop = this.state.scrollTop;
    let targetScrollTop = 0;
    let estimatedEndScrollTop = currScrollTop;

    while (Math.abs(currVelocity).toFixed(6) > 0) {
      estimatedEndScrollTop += currVelocity;
      currVelocity *= this.props.scrollingDeceleration;
    }

    // Find the page whose estimated end scrollTop is closest to 0.
    let closestZeroDelta = Infinity;
    const pageHeight = this.props.itemHeightGetter();
    const pageCount = this.props.numberOfItemsGetter();
    let pageScrollTop;

    for (let pageIndex = 0, len = pageCount; pageIndex < len; pageIndex++) {
      pageScrollTop = pageHeight * pageIndex - estimatedEndScrollTop;
      if (Math.abs(pageScrollTop) < closestZeroDelta) {
        closestZeroDelta = Math.abs(pageScrollTop);
        targetScrollTop = pageHeight * pageIndex;
      }
    }

    this.scroller.__minDecelerationScrollTop = targetScrollTop;
    this.scroller.__maxDecelerationScrollTop = targetScrollTop;
  };
}

export default ListView;
