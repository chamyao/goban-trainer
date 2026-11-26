# student progress
cd ~/goban; grep VAL ps/student.log | cut -c1-230; grep "^step" ps/student.log | tail -1 | cut -c1-150; tail -2 pro.log
