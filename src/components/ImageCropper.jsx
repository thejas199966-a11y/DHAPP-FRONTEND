import React, { useState, useRef, useEffect } from "react";
import { Box, Button, Slider, Typography } from "@mui/material";

const ImageCropper = ({ imageSrc, onCrop, onClose }) => {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(new Image());

  const canvasSize = 300; // Output avatar size

  useEffect(() => {
    const image = imageRef.current;
    image.src = imageSrc;
    image.onload = () => {
      // Center the image initially
      const initialScale = Math.max(
        canvasSize / image.width,
        canvasSize / image.height
      );
      setScale(initialScale);
      setPosition({
        x: (canvasSize - image.width * initialScale) / 2,
        y: (canvasSize - image.height * initialScale) / 2,
      });
    };
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const image = imageRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      0,
      Math.PI * 2,
      true
    );
    ctx.clip();

    // Draw the scaled and positioned image
    if (image.complete) {
      ctx.drawImage(
        image,
        position.x,
        position.y,
        image.width * scale,
        image.height * scale
      );
    }
    ctx.restore(); // restore clipping region
  }, [scale, position]);

  const handleScaleChange = (event, newValue) => {
    setScale(newValue);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPosition({ x: position.x + dx, y: position.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    // Get cropped image as Base64 data URL
    const croppedImageUrl = canvas.toDataURL("image/png");
    onCrop(croppedImageUrl);
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Crop Your Photo
      </Typography>
      <Box
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the canvas area
        sx={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{
            border: "2px dashed #ccc",
            borderRadius: "50%",
            backgroundColor: "#f0f0f0",
          }}
        />
      </Box>

      <Box sx={{ width: "80%", mt: 2 }}>
        <Typography gutterBottom>Zoom</Typography>
        <Slider
          value={scale}
          min={0.1}
          max={3}
          step={0.01}
          onChange={handleScaleChange}
          aria-labelledby="zoom-slider"
        />
      </Box>
      <Box
        sx={{
          mt: 3,
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <Button onClick={onClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default ImageCropper;
