# around the blow-up
cd ~/goban; grep -n "^step" distill/b22500.log | sed -n 3,12p | cut -c1-160; grep -n "^step" distill/run2.log | sed -n 3,8p | cut -c1-160
