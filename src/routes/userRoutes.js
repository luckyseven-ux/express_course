import express from 'express'
import {getUser,addUser,loginUser} from '../controllers/userController.js'
import { isAdmin } from '../controllers/adminController.js'

const router=express.Router()

router.get('/',getUser)
router.post('/',addUser)
router.post('/login',loginUser)

export default router;