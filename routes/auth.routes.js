const {Router} = require("express");
const bcript = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

// api/auth/register
router.post(
  '/register',
  [
    check('email','Не коректний емейл').isEmail(),
    check('password',"Минимальная длина пароля 6 символов")
      .isLength({min: 6})
  ],
   async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.aray,
        message: 'Некоректные данные при регестрации'
      })
    }
     
    const {email, password} = req.body
    const candidate = await User.findOne({email})
    if (candidate) {
      return res.status(400).json({message: "Пользователь с таким email уже существует"})
    }

    const hashedPassword = await bcript.hash(password, 12);
    const user = new User({email, password: hashedPassword})

    await user.save()

    res.status(201).json({message: "Пользователь создан"})
  } catch (err){
    res.status(500).json({message: "Something wrong try later"})
  }
})

// api/auth/login
router.post('/login',
[
  check('email','Введите коректный email').normalizeEmail().isEmail(),
  check('password', 'Введите пароль').exists()
],
 async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.aray(),
        message: 'Некоректные данные при входе в сестему'
      })
    }
    
    const {email, password} = req.body
    const user = await User.findOne({email})

    if (!user) {
      return res.status(400).json({message: "Пользователь не найден"})
    } 

    const isMatch = await bcript.compare(password, user.password)

    if (!isMatch) { 
      return res.status(400).json({message: "Неверный пароль"})
    }
    
    const token = jwt.sign(
      {userId: user.id},
      config.get('jwtSecret'),
      {expiresIn: '1h'}
    )

    res.json({token, userId: user.id})
  
  } catch (err){
    res.status(500).json({message: "Something wrong try later"})
  }
})

module.exports = router