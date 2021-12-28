const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', {title: '내 정보 - SSUstagram'});
});

router.get('/new', isLoggedIn, (req, res) => {
    res.render('new', { title: '업로드 - SSUstagram'});
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', { title: '회원가입 - SSUstagram'});
});

// router.get('/follow', isLoggedIn, (req, res) => {
//     res.render('follow', { title: '팔로우 - SSUstagram'});
// });


router.get('/', async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'mainId'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('main', {
            title: 'SSUstagram',
            twits: posts,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/home', async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'mainId'],
            },
            order: [['createdAt', 'DESC']],
        });
        res.render('main', {
            title: 'SSUstagram',
            twits: posts,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});


router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/home');
    }
    try {
        const hashtag = await Hashtag.findOne({ where: { title: {[Op.like]: `%${query}%`} } });
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }

        return res.render('main', {
            title: `${query} | SSUstagram`,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/author', async (req, res, next) => {
    const query = req.query.author;
    if (!query) {
        return res.redirect('/home');
    }
    try {
        const author = await User.findOne({ where: { mainId: {[Op.like]: `%${query}%`} } });
        let posts = [];
        if (author) {
            posts = await author.getPosts({ include: [{ model: User }] });
        }

        return res.render('main', {
            title: `${query} | SSUstagram`,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/text', async (req, res, next) => {
    const query = req.query.text;
    if (!query) {
        return res.redirect('/home');
    }
    try {
        const text = await Post.findOne({ where: { content: {[Op.like]: `%${query}%`} } });
        let posts = [];
        if (text) {
            posts = await text.getPostA({ include: [{ model: Post, as: 'PostA' }] });
        }

        return res.render('main', {
            title: `${query} | SSUstagram`,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/follow', async (req, res, next) => {
    try {
        const people = await User.findAll({
            // include: {
            //     model: User,
            //     attributes: ['id', 'mainId'],
            // },
            order: [['createdAt', 'DESC']],
        });
        // const follow = await User.db.follow.findAll();
        res.render('follow', {
            title: 'SSUstagram',
            users: people,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});




module.exports = router;