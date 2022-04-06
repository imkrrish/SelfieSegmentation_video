import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import * as cam from "@mediapipe/camera_utils";
import './App.css';
import defaultImg from './vback.jpg'
import DisplayLottie from "./DisplatLottie";
import loader from './85646-loading-dots-blue.json'

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageURL, setimageURL] = useState(defaultImg);
  const [load, setLoad] = useState(false);

  const onResults = async (results) => {
    const img = document.getElementById('vbackground')
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);

    // Only overwrite missing pixels.

    canvasCtx.globalCompositeOperation = 'destination-over';
    canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();
    setLoad(true);
  }

  useEffect(() => {
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
    });

    selfieSegmentation.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await selfieSegmentation.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720
      });

      camera.start();
    }
  }, []);

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setimageURL(reader.result);
      }
    }
    reader.readAsDataURL(e.target.files[0])
  }

  return (
    <>
      <div className="container">
        <div className="videoContainer">
          <div className="videoContent">
            <div className="video">
              <Webcam
                ref={webcamRef}
                style={{
                  display: "none",
                  width: "100%",
                  height: "100%",
                  transform: "scaleX(-1)"
                }}
              />

              <div className="loader"
                style={{
                  display: `${!load ? " " : "none"}`
                }}
              >
                <DisplayLottie animationData={loader} />
              </div>
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "100%",
                  transform: "scaleX(-1)",
                }}
              ></canvas>
            </div>
          </div>
        </div>

        <div className="backgroundContainer">
          <div className="backgrounds">
            <img id="vbackground" src={imageURL} alt="The Screan" className="background" />
          </div>
          <label htmlFor="contained-button-file" className="file-upload">
            <input accept="image/*" id="contained-button-file" multiple type="file" onChange={imageHandler} />
            Choose Background
          </label>
        </div>
      </div>
    </>
  )
}

export default App
