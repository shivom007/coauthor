const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const cors = require('cors');
app.use(cors());

const http = require('http');
const httpServer = http.createServer(app);
const mongoose = require("mongoose")
const Document = require("./Document")
require('dotenv').config();
const path = require('path')
const URI = process.env.MONGODB_URL
const CLIENT_URL = process.env.CLIENT_URL

app.use(express.urlencoded({extended:true}));

mongoose.connect(URI,{
  useNewUrlParser: true,
  connectTimeoutMS: 6000
}).then(() => {
  console.log('Connected to MongoDB');
})
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const defaultValue = ""

io.on("connection", socket => {
  console.log(socket.id)
  
  socket.on("get-document", async documentId => {
  
    console.log("document ",documentId)
    let doc = documentId
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    // console.log(socket.id)
    io.to(documentId).emit("load-document", document.data );
     console.log('load document')

    socket.on("send-changes", delta => {
      socket.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, {data})
    })
  })

  socket.on('disconnect', () => {
    console.log('disconnected', socket.id)
    for (const room in socket.rooms) {
      if (room !== socket.id) { // Exclude the socket's own id
          socket.leave(room);
          console.log(`Left room: ${room}`);
      }
  }
   })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
