# 疑难杂症

## msys-crypto-1.1.dll

执行bash ./build.sh -DskipTests

日志有这条信息：D:/devTools/git/Git/usr/bin/rsync.exe: error while loading shared libraries: msys-crypto-1.1.dll: **cannot open shared object file**: No such file or directory

找到这个文件，放到**D:/devTools/git/Git/usr/bin**下就好了