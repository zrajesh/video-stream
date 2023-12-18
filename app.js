const express = require("express");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const app = express();

const PORT = 3000;

app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/video", async (req, res) => {
    try {
        let range = req.headers.range;
        if (!range) {
            res.status(400).send("Requires range header");
            return;
        }

        const videoUrl = "https://beato-storage.s3.ap-south-1.amazonaws.com/videos/test.mp4"; // Replace with your AWS video URL
        const response = await axios.head(videoUrl);
        const videoSize = response.headers['content-length'];

        const CHUNK_SIZE = 10**6; // 1 MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;

        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": 'bytes',
            "Content-Length": contentLength,
            "Content-Type": "video/mp4"
        };

        res.writeHead(206, headers);

        const videoStream = await axios.get(videoUrl, {
            headers: {
                Range: `bytes=${start}-${end}`,
            },
            responseType: 'stream',
        });

        videoStream.data.pipe(res);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});


