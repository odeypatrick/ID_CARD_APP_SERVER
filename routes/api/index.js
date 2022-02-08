const router = require('express').Router();
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const path = require('path')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Card = require('../../model/Employee')
const User = require('../../model/User');
const Structure = require('../../model/Card')

const s3 = new aws.S3({
    accessKeyId: "AKIARCBWRMYF4M3MLIX7",
    secretAccessKey: "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",
    region: 'us-east-1',
    
})

const upload = multer({
    storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: "nimc",
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
          cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
      }
    })
  })

router.get('/', (req, res) => {
    res.json({
        msg: "Server started"
    })
})

// Login Admin
router.post('/login', (req, res) => {
    // console.log(req.body)
    User.findOne({
        username: req.body.username
    }, function (err, user) {
            if (err) {
                return res.status(500).send({success: false, msg: 'Something went wrong'})
            }
            if (!user) {
                res.status(403).send({success: false, msg: 'Authentication Failed, User not found'})
            }
            else {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        var token = jwt.sign({ userId: user._id }, 'secretkey');
                        res.status(200).json({success: true, token: token, _id: user._id})
                    }
                    else {
                        return res.status(403).send({success: false, msg: 'Authentication failed, wrong password'})
                    }
                })
            }
        }
    )
})

// Get User Info
router.get('/user', (req, res) => {
    let token = req.headers.token; // token
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if(err) return res.status(401).json({
            title: 'unauthorized'
        })

        //token is valid
        User.findOne({ _id: decoded.userId }).exec((err, user) => {
            const { _id, username, role } = user;
            if(err) return res.status(404).json({ err })
            return res.status(200).json({
                title: 'User gotten',
                user: {
                    _id,
                    username,
                    role, 
                }
            })
        })
    })
})


// Add Card
router.post('/card', upload.fields([
    { name: "image", maxCount: 1 },
    { name: "signature", maxCount: 1 }
]), (req, res, next) => {
    const { name, cardId, department, role, type, companyName, expiryDate } = req.body
    Card.create({
        name, 
        cardId, 
        department, role,
        expiryDate,
        type, companyName, 
        picture: req.files['image'][0].location, signature: req.files['signature'][0].location ? req.files['signature'][0].location : ""
    })
    .then(data => res.json(data))
    .catch(err => {
        res.status(500).json(err)
        console.log(err)
    })
})

// Add vendor card
router.post('/card/vendor', upload.single('image'), (req, res, next) => {
    const { name, cardId, type, companyName } = req.body
    Card.create({
        name, cardId, type, companyName, picture: req.file.location
    })
    .then(data => res.json(data))
    .catch(err => {
        res.status(500).json(err)
        console.log(err)
    })
})

// Add visitor card
router.post('/card/visitor', upload.single('image'), (req, res, next) => {
    const { name, cardId, type, department } = req.body
    Card.create({
        name, cardId, type, department, picture: req.file.location
    })
    .then(data => res.json(data))
    .catch(err => {
        res.status(500).json(err)
        console.log(err)
    })
})


// EDIT CARD
router.put('/card/:id', upload.fields([
    { name: "image", maxCount: 1 },
    { name: "signature", maxCount: 1 }
]), (req, res) => {
    Card.updateOne({ _id: req.params.id }, {
        $set: {
            name: req.body.name,
            cardId: req.body.cardId,
            department: req.body.department,
            picture: req.files['image'] ? req.files['image'][0].location : req.body.prevImg,
            signature: req.files['signature'] ? req.files['signature'][0].location : req.body.prevSig,
            role: req.body.role,
            expiryDate: req.body.expiryDate

        }
    })
    .then(response => {
        res.status(200).json({ msg: "Card successfully updated", response })
    })
    .catch(err => res.status(500).json(err))
})

// EDIT VISITOR CARD
router.put('/card/:id/visitor', upload.single('image'), (req, res) => {
    Card.updateOne({ _id: req.params.id }, {
        $set: {
            name: req.body.name,
            cardId: req.body.cardId,
            department: req.body.department,
            image: req.file ? req.file.location : req.body.prevImg,
        }
    })
    .then(response => {
        res.status(500).json({ msg: "Card successfully updated", response })
    })
    .catch(err => res.status(500).json(err))
})

// EDIT VENDOR CARD
router.put('/card/:id/vendor', upload.single('image'), (req, res) => {
    Card.updateOne({ _id: req.params.id }, {
        $set: {
            name: req.body.name,
            cardId: req.body.cardId,
            companyName: req.body.companyName,
            image: req.file ? req.file.location : req.body.prevImg,
        }
    })
    .then(response => {
        res.status(500).json({ msg: "Card successfully updated", response })
    })
    .catch(err => res.status(500).json(err))
})

// GET ALL RECORDS(CARDS) -------------------------------------
router.get('/records', (req, res) => {
    Card.find({ }).exec()
    .then(records => res.status(200).json(records))
    .catch(err => res.status(500).json(err))
})

router.get('/record/:id', (req, res) => {
    Card.findById(req.params.id)
    .then(record => res.status(200).json(record))
    .catch(err => res.status(500).json(err))
})

// Delete Card
router.delete('/card/:id', (req, res) => {
    Card.deleteOne({ _id: req.params.id }).exec((err, data) => {
        if(err)
            return res.status(500).json({ msg: "Sorry, could not delete record" })
        res.json({
            msg: "Record deleted succesfully"
        })  
    })
})


// SIGNUP
router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if ((!req.body.username) || (!req.body.password)) {
        res.json({success: false, msg: 'Enter all fields'})
    }
    else {
        User.findOne({ username: req.body.username }, (err, user) => {
            //check for server errors
            if(err) {
                return res.status(500).json({ success: false, message: "Something went wrong" })
            }
    
            // verify if username already exist
            if(user) {
                return res.status(401).json({ success: false, message: "Username Already Taken" })
            }
                //if every thing is fine. then create user
                var newUser = User(req.body);
                newUser.save(function (err, newUser) {
                    if (err) {
                        res.json({success: false, msg: 'Failed to save'})
                    }
                    else {
                        res.json({success: true, msg: 'Successfully saved'})
                    }
                })
        })
    }
})

////////////////////////////////////////////////////////////////
// Update Card structure
router.post('/card/structure', upload.single('signature'), (req, res, next) => {
    const { declaration, companyName, address, phoneNumber, branch } = req.body
    Structure.create({
        declaration,
        companyName, 
        address, 
        phoneNumber, 
        branch, 
        signature: req.file.location
    })
    .then(data => res.status(200).json(data))
    .catch(err => {
        res.status(500).json(err)
        console.log(err)
    })
})

router.get('/card/structure', (req, res) => {
    Structure.find({})
    .then((response) => res.json(response))
    .catch(err => res.status(500).json(err))
})

// router.put('/card/structure/:id', upload.single('signature'), (req, res, next) => {
//     // const { declaration, companyName, address, phoneNumber, branch } = req.body
//     // Structure.updateOne({ _id: "" }, { 
//     //     $set: {
//     //         declaration, companyName, address, phoneNumber, branch, 
//     //         signature: req.file.location
//     //     }
//     // })
//     // .then(data => res.status(200).json(data))
//     // .catch(err => res.status(500).json(err))
//     console.log(req.params.id)
// })
module.exports = router;