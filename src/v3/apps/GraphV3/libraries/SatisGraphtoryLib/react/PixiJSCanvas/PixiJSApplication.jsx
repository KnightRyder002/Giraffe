import React from 'react';
import PIXI from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/utils/PixiProvider';
import { pixiJsStore } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/stores/PixiJSStore';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { sgDevicePixelRatio } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/utils/canvasUtils';
import { Viewport } from 'pixi-viewport';
import { PixiJSCanvasContext } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/react/PixiJSCanvas/PixiJsCanvasContext';
import MouseState from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/enums/MouseState';
import {
  addChild,
  removeChild,
} from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/core/api/canvas';
import { enableSelectionBox } from 'v3/apps/GraphV3/libraries/SatisGraphtoryLib/canvas/objects/SelectionBox';

const useStyles = makeStyles(() =>
  createStyles({
    hidden: {
      display: 'none',
    },
  })
);

function PixiJSApplication(props) {
  const { height, width, onSelectNodes } = props;

  const {
    pixiCanvasStateId,
    pixiViewport,
    mouseState,
    pixiRenderer,
    viewportChildContainer,
  } = React.useContext(PixiJSCanvasContext);

  const styles = useStyles();

  const canvasRef = React.useRef();
  const originalCanvasRef = React.useRef(null);

  const lastTarget = React.useRef();

  React.useEffect(() => {
    const mouseDownEvent = function (event) {
      lastTarget.current = event.target;
      console.log('mousedown');
    };

    const keyDownEvent = function (event) {
      if (lastTarget.current === canvasRef.current) {
        console.log('keydown');
      }
    };
    window.addEventListener('mousedown', mouseDownEvent, false);

    window.addEventListener('keydown', keyDownEvent, false);
    return () => {
      window.removeEventListener('mousedown', mouseDownEvent);
      window.removeEventListener('keydown', keyDownEvent);
    };
  }, []);

  React.useEffect(() => {
    if (originalCanvasRef.current !== canvasRef.current) {
      originalCanvasRef.current = canvasRef.current;

      pixiJsStore.update((sParent) => {
        const s = sParent[pixiCanvasStateId];

        // try {
        let newApplication = new PIXI.Application({
          transparent: true,
          autoDensity: true,
          height,
          width,
          view: canvasRef.current,
          resolution: sgDevicePixelRatio,
          antialias: true,
        });

        // ticker.start();

        const viewport = new Viewport({
          screenWidth: width,
          screenHeight: height,
          worldWidth: 20000,
          worldHeight: 20000,
          // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
          interaction: newApplication.renderer.plugins.interaction,
        });

        newApplication.stage.addChild(viewport);

        if (s?.application?.destroy) {
          s.application.destroy();
        }

        const container = new PIXI.Container();
        s.viewportChildContainer = container;
        viewport.addChild(container);

        s.viewport = viewport;

        viewport.drag().pinch().wheel({
          smooth: 5,
        });

        s.application = newApplication;

        s.applicationLoaded = true;

        // ticker.add(function (time) {

        // });
        // } catch(e) {
        //  // Probably ask the user to turn on webGL
        // }
      });
    }
  }, [canvasRef, height, pixiCanvasStateId, width]);

  const previousMouseState = React.useRef(null);

  // const selectDragFunction = React.useCallback(function() {
  //   console.log(mouseState);
  // }, [mouseState])
  //
  // const initialEventsInitialized = React.useRef(false);
  // const initialEvents = React.useRef(null);
  // const pixiEvents = pixiViewport?._events
  //
  // React.useEffect(() => {
  //   if (pixiEvents && !initialEventsInitialized.current) {
  //     initialEventsInitialized.current = true;
  //     initialEvents.current = pixiEvents;
  //   }
  //
  // }, [pixiViewport, pixiEvents])

  const selectionBoxId = React.useRef(null);
  const pixiViewportFunc = React.useRef(null);

  React.useEffect(() => {
    if (!pixiViewport) return;

    previousMouseState.current = mouseState;

    pixiViewport.plugins.pause('drag');
    pixiViewport.plugins.resume('wheel');
    pixiViewport.plugins.pause('pinch');
    viewportChildContainer.interactive = false;
    viewportChildContainer.buttonMode = false;
    viewportChildContainer.hitArea = null;
    viewportChildContainer.removeAllListeners();

    if (pixiViewportFunc.current) {
      pixiViewport.off('zoomed-end', pixiViewportFunc.current);
      pixiViewport.off('drag-end', pixiViewportFunc.current);
      pixiViewportFunc.current = null;
    }

    if (selectionBoxId.current) {
      removeChild(selectionBoxId.current, pixiCanvasStateId);
      selectionBoxId.current = null;
    }

    pixiViewportFunc.current = function () {
      viewportChildContainer.hitArea = pixiViewport.hitArea;
    };

    pixiViewport.on('zoomed-end', pixiViewportFunc.current);
    pixiViewport.on('drag-end', pixiViewportFunc.current);

    if (mouseState === MouseState.SELECT) {
      viewportChildContainer.interactive = true;
      viewportChildContainer.buttonMode = true;
      viewportChildContainer.hitArea = pixiViewport.hitArea;

      const selectionBox = new PIXI.Graphics();
      selectionBoxId.current = addChild(selectionBox, pixiCanvasStateId);

      enableSelectionBox(
        pixiViewport,
        viewportChildContainer,
        selectionBox,
        onSelectNodes
      );
    } else if (mouseState === MouseState.MOVE) {
      pixiViewport.plugins.resume('drag');
      pixiViewport.plugins.resume('wheel');
      pixiViewport.plugins.resume('pinch');
      // viewportChildContainer.interactive = true;
      // viewportChildContainer.buttonMode = true;
      //
      // viewportChildContainer.hitArea = pixiViewport.hitArea;
      //
      // let sourceX = 0;
      // let sourceY = 0;
      // const threshold = 2;
      //
      // viewportChildContainer.on('pointerdown', function () {
      //   const point = pixiViewport.toWorld(this.position.x, this.position.y);
      //   sourceX = point.x
      //   sourceY = point.y
      //
      // });
      // viewportChildContainer.on('click', function () {
      //   const point = pixiViewport.toWorld(this.position.x, this.position.y);
      //   if (Math.abs(point.x - sourceX) < threshold ||
      //     Math.abs(point.y - sourceY) < threshold) {
      //     onSelectNodes([]);
      //   }
      // });
    }
  }, [
    mouseState,
    onSelectNodes,
    pixiCanvasStateId,
    pixiViewport,
    previousMouseState,
    viewportChildContainer,
  ]);

  React.useEffect(() => {
    if (pixiRenderer) {
      // Are both necessary?
      pixiRenderer.resize(width, height);
      pixiViewport.resize(width, height);
    }
  }, [height, pixiRenderer, pixiViewport, width]);

  return (
    <canvas className={props.hidden ? styles.hidden : null} ref={canvasRef} />
  );
}

export default PixiJSApplication;
