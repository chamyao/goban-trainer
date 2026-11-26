# progress
cd ~/goban; grep VAL ps/student.log | tail -3 | cut -c1-230; tail -4 pro.log | cut -c1-200; for s in takemiya goseigen; do grep VAL ps/$s.log 2>/dev/null | tail -1 | cut -c1-160; done
