timit_map_str = """
h# 1
d 7
ih 6
dcl 1
jh 4
ux 6
n 7
ow 5
hv 4
iy 6
z 4
ae 6
v 12
axr 6
tcl 1
t 7
ay 9
ng 4
hh 4
m 4
r 2
ey 6
ax 6
kcl 1
k 4
w 8
q 1
ix 6
f 12
s 4
l 7
dh 4
epi 1
eh 6
b 3
ao 5
th 4
er 2
bcl 1
aw 11
y 6
aa 5
ax-h 6
ah 1
nx 7
en 7
ch 4
sh 4
pcl 1
p 3
dx 7
el 7
oy 5
gcl 1
g 4
pau 1
uw 8
zh 4
uh 8
em 4
eng 4
"""
timit_char_map = {}
timit_index_map = {}
for line in timit_map_str.strip().split('\n'):
	ch, index = line.split()
	timit_char_map[ch] = int(index)
	timit_index_map[int(index)] = ch