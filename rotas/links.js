const express = require('express')
const router = express.Router()
const pool = require('./connection')
const { validateToken } = require('../middleware/AuthMiddleware');
const { response } = require('express');

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 } 

router.get('/links', validateToken, (req, res) => {
    const id = req.user.id
    pool.getConnection((error,db) => {
        db.query(
            "SELECT id, slug, DATE(data) AS data FROM links WHERE idUsuario = ?; ",
            id,
            (err, result) => {
                if(err){
                    res.send('Não foi possível encontrar links deste usuário!')
                } else {
                    res.send(result)
                }
            }
        )
        db.release()
    })
})

router.post('/links/novoLink', validateToken, (req,res) => {
    const url = req.body.url
    const idUsuario = req.user.id;
    const slug = makeid(10);
    pool.getConnection((error,db) => {
        db.query(
            "INSERT INTO links (url, slug, idUsuario) VALUES (?,?,?);",
            [url,slug,idUsuario],
            (err, result) => {
                if(err){
                console.log(err)
                }
            }
        )
        db.release()
    })
    res.json({ message: slug })
})

router.delete('/links/delete', validateToken, (req,res) => {
    const slug = req.slug
    pool.getConnection((error,db) => {
        db.query(
            "DELETE FROM links WHERE slug = ? ;",
            slug,
            (err, result) => {
                if(err){
                console.log(err)
                }
            }
        )
        db.release()
    })
    res.json({ message: 'Link deletado dos seus encurtados!' })
})

router.put('/links/mudarSlug', validateToken, (req,res) => {
    const slug = req.body.slug;
    const newslug = req.body.newslug;
    pool.getConnection((error,db) => {
        db.query(
            "UPDATE links SET slug = ? WHERE slug = ?;",
            [newslug,slug],
            (err, result) => {
                if(err){
                console.log(err)
                }
            }
        )
        db.release()
    })
    res.json({ message: 'Codigo encurtador atualizado!' })
})

router.post('/links/redirecionar', (req,res) => {
    const slug = req.body.slug
    console.log(slug)
    pool.getConnection((error,db) => {
        db.query(
            "SELECT url, slug FROM links WHERE slug = ?;",
            slug,
            (error, result) => {
                if(result){
                        if(result[0] != undefined){
                            res.json({ url: result[0].url})}
                        else {
                            res.json({ error: 'Nao encontrado!'})
                        }
                    }
                    else {
                    res.json({ error: 'Pagina não encontrada!'})
                    }
                }
            )
        db.release()
    })
})

module.exports = router;