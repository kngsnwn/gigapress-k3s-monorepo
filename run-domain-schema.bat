@echo off
echo Starting Domain Schema Service on port 8083...
cd /d "C:\Users\ksw\Desktop\dev\gigapress-light\domain-schema-service"
java -jar build\libs\domain-schema-service-*.jar
pause