const express=require("express");
const router=express.Router();
var mysql=require('mysql');
var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'courseregistration'
});
connection.connect();
router.use(express.urlencoded({ extended: true }));
router.get('/',(req,res)=>{
    res.render("login");
})
router.post("/studentlogin",(req,res)=>{
    console.log(req.body.userpassword);
    console.log(req.body.useremail);
    const pass=req.body.userpassword;
    const email=req.body.useremail;
    connection.query(`SELECT * FROM student WHERE useremail='${email}' and userpassword='${pass}'`,function(error,results,fields){
        if(results.length!=0)
        {
            connection.query(`select * from student where useremail='${email}'`, function (err, result, fields) {
                res.redirect(`studenthome`);
            });
        }
        else{
            res.render('invalid');
        }
    });
})
// router.get("/", (req, res) => {
//     res.render("login");
// })
router.post("/adminlogin",(req,res)=>{
    console.log(req.body.password);
    console.log(req.body.email);
    const pass=req.body.password;
    const email=req.body.email;
    connection.query(`select * from admin where email='${email}' and password='${pass}' `,function(error,results,fields){
        if(results.length!=0)
        {
            connection.query(`select * from admin where email='${email}'`,function(err,result,fields){
                res.redirect(`admin`);
            });
        }
        else{
            res.render('invalid');
            // console.error('Error executing admin login query:', error);
        }
    });
})
router.get("/register.ejs", (req, res) => {
    res.render("register");
})
router.post("/studentregister", (req, res) => {
    const email = req.body.useremail;
    const password = req.body.userpassword;
    connection.query(`insert into student values('${email}','${password}')`);

    res.redirect('/');

})
router.get('/studenthome.ejs',(req,res)=>{
    res.render("studenthome");
})
// router.get('/studenthome', (req, res) => {
//     const queryAllCourses = `SELECT coursename, instructor, notes FROM courses`;
//     connection.query(queryAllCourses, (error, allCourses) => {
//         if (error) {
//             console.error('Error fetching all courses:', error);
//             res.render('error');
//             return;
//         }
//         const queryAllReviews = `
//             SELECT coursename, rating, review, feedback FROM reviews`;
//         connection.query(queryAllReviews, (err, allReviews) => {
//             if (err) {
//                 console.error('Error fetching all reviews:', err);
//                 res.render('error'); 
//                 return;
//             }
//             const coursesWithReviews = allCourses.map(course => {
//                 const reviewsForCourse = allReviews.filter(review => review.courseName === course.courseName);
//                 return { ...course, reviews: reviewsForCourse };
//             });
//             // res.render('studenthome', { coursesWithReviews });
//             // const successMessage = req.query.success;
//             // res.render('studenthome', { successMessage });
//             const successMessage = req.query.success;
//             res.render('studenthome', { coursesWithReviews, successMessage });
//         });
//     });
// });
router.get('/studenthome', (req, res) => {
    const queryAllCourses = `SELECT coursename, instructor, notes FROM courses`;
    const queryAllReviews = `SELECT coursename, rating, review, feedback FROM reviews`;
    const queryPastQuestions = `SELECT * FROM questions WHERE answer IS NOT NULL`;
    connection.query(queryAllCourses, (errorCourses, allCourses) => {
        if (errorCourses) {
            console.error('Error fetching all courses:', errorCourses);
            res.render('error');
            return;
        }
        connection.query(queryAllReviews, (errorReviews, allReviews) => {
            if (errorReviews) {
                console.error('Error fetching all reviews:', errorReviews);
                res.render('error');
                return;
            }
            connection.query(queryPastQuestions, (errorQuestions, pastQuestions) => {
                if (errorQuestions) {
                    console.error('Error fetching past questions:', errorQuestions);
                    res.render('error');
                    return;
                }
                const coursesWithReviews = allCourses.map(course => {
                    const reviewsForCourse = allReviews.filter(review => review.courseName === course.courseName);
                    return { ...course, reviews: reviewsForCourse };
                });
                const successMessage = req.query.success;
                res.render('studenthome', { coursesWithReviews, successMessage, pastQuestions });
            });
        });
    });
});

router.post('/submitReview', (req, res) => {
    const { name,coursename, rating, review, feedback } = req.body;
    const query = `
        INSERT INTO reviews (name,coursename, rating, review, feedback) VALUES (?,?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating), review = VALUES(review), feedback = VALUES(feedback)`;
    connection.query(query, [name,coursename, rating, review, feedback], (error, result) => {
        if (error) {
            console.error('Error submitting review:', error);
            res.render('error'); 
            return;
        }

        res.redirect('/studenthome');
    });
});
// router.get('/admin', (req, res) => {
//     connection.query('SELECT * FROM courses', (error, courses) => {
//         if (error) {
//             console.error('Error fetching courses from database:', error);
//             res.render('error'); 
//             return;
//         }
//         const query = 'SELECT * FROM questions';
//         connection.query(query, (err, queries) => {
//             if (err) {
//                 console.error('Error fetching queries from database:', err);
//                 res.render('error');
//                 return;
//             }
//             res.render('admin', { courses, queries });
//         });
//     });
// });

// router.get('/admin', (req, res) => {
//     connection.query('SELECT * FROM courses', (error, courses) => {
//         // if (error) {
            // console.error('Error fetching courses from database:', error);
            // res.render('error'); 
        //     throw error;
        // }
        // const query = 'SELECT * FROM questions';
        // connection.query(query, (err, queries) => {
        //     if (err) {
        //         console.error('Error fetching queries from database:', err);
        //         res.render('error'); 
        //         return;
        //     }
        //     console.log('Queries fetched from database:', queries); 
        //     res.render('admin', { courses, queries });
        // });
//     });
// });
// router.get('/admin', (req, res) => {
//     connection.query('SELECT * FROM courses', (error, courses) => {
//         if (error) throw error;
//         connection.query('SELECT * FROM questions', (err, questions) => {
//             if (err) {
//                 console.error('Error fetching questions from database:', err);
//                 res.render('error'); 
//                 return;
//             }
//             res.render('admin', { courses, questions:results });
//         });
//     });
// });
router.get('/admin', (req, res) => {
    connection.query('SELECT * FROM courses', (error, courses) => {
        if (error) throw error;
        connection.query('SELECT * FROM questions', (err, questions) => {
            if (err) {
                console.error('Error fetching questions from database:', err);
                res.render('error'); 
                return;
            }
            res.render('admin', { courses, questions });
        });
    });
});

router.post('/addCourse', (req, res) => {
    const { coursename, instructor, notes } = req.body;
    connection.query('INSERT INTO courses (coursename, instructor, notes) VALUES (?, ?, ?)', [coursename, instructor, notes], (error, results) => {
        if (error) throw error;
        res.redirect('/admin');
    });
});

router.post('/deleteCourse', (req, res) => {
    const coursename = req.body.courseNameToDelete;
    console.log('Course Name:', coursename);
    connection.query('DELETE FROM courses WHERE coursename = ?', coursename, (error, results) => {
        if (error) throw error;
        console.log('Deleted:', results.affectedRows);
        res.redirect('/admin');
    });
});

router.post('/askQuestion', (req, res) => {
    const { question } = req.body;
    const query = 'INSERT INTO questions (question_text) VALUES (?)';
    connection.query(query, [question], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error submitting question');
        } else {
            
            // res.redirect('/studenthome'); 
            res.redirect('/studenthome?success=Question submitted successfully');
        }
    });
});



router.get('/admin/queries', (req, res) => {
    const query = 'SELECT * FROM questions';
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching queries');
        } else {
            res.render('admin-queries', { queries: results });
        }
    });
});

router.get('/admin/questions', (req, res) => {
    const query = 'SELECT * FROM questions';
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching questions');
        } else {
            res.render('admin-questions', { questions: results });
        }
    });
});
// router.post('/answerQuery/:id', (req, res) => {
//     const questionId = req.params.id;
//     const answer = req.body.answer;
//     const query = 'UPDATE questions SET answer = ? WHERE id = ?';
//     connection.query(query, [answer, questionId], (error, results) => {
//         if (error) {
//             console.error('Error adding answer to database:', error);
//             res.render('error'); 
//             return;
//         }
//         console.log('Answer added to database successfully');
//         res.redirect('/admin');
//     });
// });
router.post('/answerQuery/:id', (req, res) => {
    const questionId = req.params.id;
    const answer = req.body.answer;
    const query = 'UPDATE questions SET answer = ? WHERE id = ?';
    connection.query(query, [answer, questionId], (error, results) => {
        if (error) {
            console.error('Error adding answer to database:', error);
            res.render('error', { message: 'Error adding answer to database' }); // Pass an error message to the error page
            return;
        }
        console.log('Answer added to database successfully');
        res.redirect('/admin');
    });
});
router.post('/checkAnswer', (req, res) => {
    const name = req.body.name;
    const query = 'SELECT answer FROM questions WHERE name = ?';
    connection.query(query, [name], (error, results) => {
        if (error) {
            console.error('Error fetching answer from database:', error);
            res.render('error'); 
            return;
        }

        if (results.length > 0) {
            const answerFromAdmin = results[0].answer;
            res.render('studenthome', { answerFromAdmin });
        } else {
            res.render('error', { errorMessage: 'No answer found for the given name.' });
        }
    });
});


// router.get('/logout', (req, res) => {
    
//     res.redirect('/');
// })
router.post('/logout', (req, res) => {
    
        res.redirect('/');
    });
module.exports=router;