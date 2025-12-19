eloDiff = 40
mEloDiff = -40

eloW = 30
eloL = 30

surDiff=0
for i in range(-50, 0, 10):
    surDiff+=1
    eloW += 1 + surDiff/10

surDiff=0
for i in range(50, 0, -10):
    surDiff+=1
    eloL -= 1 + surDiff/10
    

print("eloL :", eloL)
print("eloW :", eloW)
