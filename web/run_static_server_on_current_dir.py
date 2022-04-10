import os

PORT = 5000

# Running HTTP server (not https)
print ("Starting Static server for dir: "+ os.getcwd())
print ("URL: http://localhost:"+str(PORT)+"\n")
os.system ("python -m http.server "+str(PORT))
