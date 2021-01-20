# Mapping dictionary from model encoding to phones

timit_map_str = """
h# 0
d 1
ih 2
dcl 3
jh 4
ux 5
n 6
ow 7
hv 8
iy 9
z 10
ae 11
v 12
axr 13
tcl 14
t 15
ay 16
ng 17
hh 18
m 19
r 20
ey 21
ax 22
kcl 23
k 24
w 25
q 26
ix 27
f 28
s 29
l 30
dh 31
epi 32
eh 33
b 34
ao 35
th 36
er 37
bcl 38
aw 39
y 40
aa 41
ax-h 42
ah 43
nx 44
en 45
ch 46
sh 47
pcl 48
p 49
dx 50
el 51
oy 52
gcl 53
g 54
pau 55
uw 56
zh 57
uh 58
em 59
eng 60
"""
timit_char_map = {}
timit_index_map = {}
for line in timit_map_str.strip().split('\n'):
	ch, index = line.split()
	timit_char_map[ch] = int(index)
	timit_index_map[int(index)] = ch