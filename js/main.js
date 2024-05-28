document.addEventListener('DOMContentLoaded', () => {
    const proVideo = document.getElementById("pro-video");
    const youthVideo = document.getElementById("youth-video");
    const uploadPro = document.getElementById("upload-pro");
    const uploadYouth = document.getElementById("upload-youth");
    
    uploadPro.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const fileURL = URL.createObjectURL(file);
        proVideo.src = fileURL;
        proVideo.load();
        proVideo.parentElement.classList.remove('placeholder');
    });

    uploadYouth.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const fileURL = URL.createObjectURL(file);
        youthVideo.src = fileURL;
        youthVideo.load();
        youthVideo.parentElement.classList.remove('placeholder');
    });

    const fps = 24;

    document.getElementById('play-pause').addEventListener('click', () => {
        const selectedVideo = getSelectedVideo();
        if (selectedVideo.paused) {
            selectedVideo.play();
        } else {
            selectedVideo.pause();
        }
    });

    document.getElementById('step-back').addEventListener('click', () => {
        const selectedVideo = getSelectedVideo();
        selectedVideo.currentTime = Math.max(0, selectedVideo.currentTime - (1 / fps));
    });

    document.getElementById('step-forward').addEventListener('click', () => {
        const selectedVideo = getSelectedVideo();
        selectedVideo.currentTime = Math.min(selectedVideo.duration, selectedVideo.currentTime + (1 / fps));
    });

    document.getElementById('scrubber').addEventListener('input', function() {
        const selectedVideo = getSelectedVideo();
        const scrubTime = (this.value / 100) * selectedVideo.duration;
        selectedVideo.currentTime = scrubTime;
    });

    document.querySelectorAll('input[name="video-select"]').forEach((radio) => {
        radio.addEventListener('change', (event) => {
            // No-op since it was empty
        });
    });

    function getSelectedVideo() {
        const selectedValue = document.querySelector('input[name="video-select"]:checked').value;
        return (selectedValue === 'top') ? proVideo : youthVideo;
    }

    document.getElementById('capture').addEventListener('click', () => {
        const screenshotCanvas = document.createElement('canvas');
        const canvasContext = screenshotCanvas.getContext('2d');

        const proAspectRatio = proVideo.videoWidth / proVideo.videoHeight;
        const youthAspectRatio = youthVideo.videoWidth / youthVideo.videoHeight;

        const canvasWidth = proVideo.videoWidth;

        const proHeight = canvasWidth / proAspectRatio;
        const youthHeight = canvasWidth / youthAspectRatio;

        screenshotCanvas.width = canvasWidth;
        screenshotCanvas.height = proHeight + youthHeight;

        canvasContext.drawImage(proVideo, 0, 0, canvasWidth, proHeight);
        canvasContext.drawImage(youthVideo, 0, proHeight, canvasWidth, youthHeight);

        const screenshotView = document.getElementById('screenshot-view');
        const existingCanvas = document.getElementById('screenshot-canvas');
        if (existingCanvas) {
            screenshotView.removeChild(existingCanvas);
        }
        screenshotCanvas.id = 'screenshot-canvas';
        screenshotView.appendChild(screenshotCanvas);

        switchToScreenshotView();
        initializeDrawing(screenshotCanvas);
    });

    function switchToScreenshotView() {
        document.getElementById('video-controls').style.display = 'none';
        document.getElementById('screenshot-controls').style.display = 'flex';
        document.getElementById('screenshot-view').style.display = 'block';
        document.getElementById('drawing-tools').style.display = 'block'; // Show drawing tools
    }

    document.getElementById('share-screenshot').addEventListener('click', () => {
        const screenshotCanvas = document.getElementById('screenshot-canvas');
        const imageDataURL = screenshotCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL;
        downloadLink.download = 'screenshot.png';
        downloadLink.click();
    });

    document.getElementById('exit-screenshot-view').addEventListener('click', () => {
        document.getElementById('video-controls').style.display = 'block';
        document.getElementById('screenshot-controls').style.display = 'none';
        document.getElementById('screenshot-view').style.display = 'none';
        document.getElementById('drawing-tools').style.display = 'none'; // Hide drawing tools

        const screenshotCanvas = document.getElementById('screenshot-canvas');
        if (screenshotCanvas) {
            screenshotCanvas.getContext('2d').clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height); // Clear the canvas
            const screenshotView = document.getElementById('screenshot-view');
            screenshotView.removeChild(screenshotCanvas); // Remove the canvas from the screenshot view
        }
    });

    document.getElementById('flip-pro').addEventListener('click', () => {
        proVideo.classList.toggle('flip');
    });

    function initializeDrawing(canvas) {
        let isDrawing = false;
        let x = 0;
        let y = 0;
        const context = canvas.getContext('2d');

        canvas.addEventListener('mousedown', e => {
            const rect = canvas.getBoundingClientRect();
            x = (e.clientX - rect.left) * (canvas.width / rect.width);
            y = (e.clientY - rect.top) * (canvas.height / rect.height);
            isDrawing = true;
        });

        canvas.addEventListener('mousemove', e => {
            if (isDrawing === true) {
                const rect = canvas.getBoundingClientRect();
                const newX = (e.clientX - rect.left) * (canvas.width / rect.width);
                const newY = (e.clientY - rect.top) * (canvas.height / rect.height);
                drawLine(context, x, y, newX, newY);
                x = newX;
                y = newY;
            }
        });

        window.addEventListener('mouseup', e => {
            if (isDrawing === true) {
                const rect = canvas.getBoundingClientRect();
                const newX = (e.clientX - rect.left) * (canvas.width / rect.width);
                const newY = (e.clientY - rect.top) * (canvas.height / rect.height);
                drawLine(context, x, y, newX, newY);
                x = 0;
                y = 0;
                isDrawing = false;
            }
        });
    }

    function drawLine(context, x1, y1, x2, y2) {
        const colorPicker = document.getElementById('colorPicker');
        const brushSize = document.getElementById('brushSize');

        context.beginPath();
        context.strokeStyle = colorPicker.value;
        context.lineWidth = brushSize.value;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }

    // Add drawing tools dynamically
    const drawingTools = document.createElement('div');
    drawingTools.id = 'drawing-tools';
    drawingTools.innerHTML = `
        <input type="color" id="colorPicker" value="#000000">
        <input type="number" id="brushSize" value="5" min="1" max="100">
    `;
    document.body.appendChild(drawingTools);
});
