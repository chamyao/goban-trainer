// Book 2's last beat hands on to Book 3 (book-handoff.js with FROM=2)
process.env.FROM=process.env.FROM||'2';require('./book-handoff.js');
