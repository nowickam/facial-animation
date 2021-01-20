# Mapping dictionary from phones to visemes

viseme_map = """
h# 0
d 7
ih 2
dcl 0
jh 9
ux 2
n 8
ow 12
hv 9
iy 2
z 7
ae 11
v 3
axr 2
tcl 0
t 7
ay 14
ng 8
hh 8
m 1
r 9
ey 11
ax 2
kcl 0
k 8
w 4
q 0
ix 2
f 3
s 7
l 8
dh 7
epi 0
eh 11
b 1
ao 12
th 7
er 9
bcl 0
aw 10
y 2
aa 12
ax-h 2
ah 14
nx 8
en 8
ch 9
sh 9
pcl 0
p 1
dx 8
el 8
oy 12
gcl 0
g 8
pau 0
uw 4
zh 9
uh 4
em 1
eng 8

"""
viseme_char_map = {}
viseme_index_map = {}
for line in viseme_map.strip().split('\n'):
	ch, index = line.split()
	viseme_char_map[ch] = int(index)
	viseme_index_map[int(index)] = ch