#!/usr/bin/expect -f

set password "1009"
set timeout 30

spawn ssh -p 2222 ksw@175.208.154.213 "sudo docker images"

expect {
    "password:" {
        send "$password\r"
        expect {
            "[sudo] password for ksw:" {
                send "$password\r"
                expect eof
            }
            eof
        }
    }
    eof
}

catch wait result
exit [lindex $result 3]