import React from "react";
import PropTypes from "prop-types";
import CanvasComponent from "./CanvasComponent";
import Core from "./Core";
import ImageCache from "./ImageCache";
import { easeInCubic } from "./Easing";
import clamp from "./clamp";

const RawImageName = "RawImage";
const { Group } = Core;

const FADE_DURATION = 200;

const LAYER_TYPE = "image";

export class RawImage extends CanvasComponent {
  applyLayerProps = (prevProps, props) => {
    const layer = this.node;

    if (layer.type !== LAYER_TYPE) {
      layer.type = LAYER_TYPE;
    }

    if (layer.imageUrl !== props.src) {
      layer.imageUrl = props.src;
    }

    this.applyCommonLayerProps(prevProps, props);
  };
}

export default class Image extends React.Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    style: PropTypes.object,
    useBackingStore: PropTypes.bool,
    fadeIn: PropTypes.bool,
    fadeInDuration: PropTypes.number
  };

  constructor(props) {
    super(props);
    const loaded = ImageCache.get(props.src).isLoaded();

    this.state = {
      loaded: loaded,
      imageAlpha: loaded ? 1 : 0
    };
  }

  componentDidMount() {
    ImageCache.get(this.props.src).on("load", this.handleImageLoad);
  }

  componentWillUnmount() {
    if (this._pendingAnimationFrame) {
      cancelAnimationFrame(this._pendingAnimationFrame);
      this._pendingAnimationFrame = null;
    }
    ImageCache.get(this.props.src).removeListener("load", this.handleImageLoad);
  }

  componentDidUpdate(prevProps) {
    if (this.props.src !== prevProps.src) {
      ImageCache.get(prevProps.src).removeListener(
        "load",
        this.handleImageLoad
      );
      ImageCache.get(this.props.src).on("load", this.handleImageLoad);
      const loaded = ImageCache.get(this.props.src).isLoaded();
      this.setState({ loaded: loaded });
    }

    if (this.rawImageRef) {
      this.rawImageRef.getLayer().invalidateLayout();
    }
  }

  setRawImageRef = ref => (this.rawImageRef = ref);
  setGroupRef = ref => (this.groupRef = ref);

  render() {
    const imageStyle = Object.assign({}, this.props.style);
    const style = Object.assign({}, this.props.style);
    const backgroundStyle = Object.assign({}, this.props.style);
    const useBackingStore = this.state.loaded
      ? this.props.useBackingStore
      : false;

    // Hide the image until loaded.
    imageStyle.alpha = this.state.imageAlpha;

    // Hide opaque background if image loaded so that images with transparent
    // do not render on top of solid color.
    style.backgroundColor = imageStyle.backgroundColor = null;
    backgroundStyle.alpha = clamp(1 - this.state.imageAlpha, 0, 1);

    return (
      <Group ref={this.setGroupRef} style={style}>
        <Group style={backgroundStyle} />

        <RawImageName
          ref={this.setRawImageRef}
          src={this.props.src}
          style={imageStyle}
          useBackingStore={useBackingStore}
        />
      </Group>
    );
  }

  handleImageLoad = () => {
    let imageAlpha = 1;
    if (this.props.fadeIn) {
      imageAlpha = 0;
      this._animationStartTime = Date.now();
      this._pendingAnimationFrame = requestAnimationFrame(
        this.stepThroughAnimation
      );
    }
    this.setState({ loaded: true, imageAlpha: imageAlpha });
  };

  stepThroughAnimation = () => {
    const fadeInDuration = this.props.fadeInDuration || FADE_DURATION;
    let alpha = easeInCubic(
      (Date.now() - this._animationStartTime) / fadeInDuration
    );
    alpha = clamp(alpha, 0, 1);
    this.setState({ imageAlpha: alpha });
    if (alpha < 1) {
      this._pendingAnimationFrame = requestAnimationFrame(
        this.stepThroughAnimation
      );
    }
  };
}
