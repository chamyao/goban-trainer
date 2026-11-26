# progress
cd ~/goban; grep VAL ps/student.log | tail -2 | cut -c1-230; grep "^step" ps/student.log | tail -1 | cut -c1-150; tail -3 pro.log | cut -c1-150; for s in takemiya goseigen; do echo "$s: $(grep VAL ps/$s.log 2>/dev/null | tail -1 | cut -c1-150)"; done
