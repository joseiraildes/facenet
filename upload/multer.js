const multer = require("multer")

const storage = multer.diskStorage({
  destination: (req, file, db)=>{
    cb(null, "upload/photos/")
  },
  filename: (req, file, cb)=>{
    const extension = file.originalname.split('.')[1]
  
    const filename = require("crypto")
     .randomBytes(64)
     .toString("hex")

     cb(null, `${filename}.${extension}`)
  }
})

module.exports = {
  upload: multer({ storage })
}