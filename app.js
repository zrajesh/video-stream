const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

const PORT = 3000;

app.use(cors());

app.get("/", (req, res) => {
    res.sendFile(__dirname+"/index.html");
    // res.send("hello");
});

app.get("/video", (req, res) => {
    let range = req.headers.range;
    if (!range) {
        // range = 'bytes=0-'
        res.status(400).send("Requires range header");
    }
    const videoPath = "./test.mp4";
    const videoSize = fs.statSync(videoPath).size;
    console.log("Size of the video is: ", videoSize);
    const CHUNK_SIZE = 10**6; // 1 MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    }
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, {start, end});
    videoStream.pipe(res);
});
 

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})

